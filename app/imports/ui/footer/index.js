import './footer.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from '/public/moment-with-locales.min.js';
import { sprintf } from 'sprintf-js';
import turf from '@turf/turf';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';
import { waypoint } from '/imports/api/travels/methods';

const notification_title = 'Capteur de position';

Template.footer.onCreated(function () {
    const self = this;
    self.subscribe('travels::current');
    self.button_groups = [
        {
            code: 'parameters',
            show: true,
            mr: 'mr-2',
            buttons: [
                {
                    code: 'parameters',
                    icon: 'cog',
                    color: 'secondary',
                    show: () => Meteor.userId(),
                },
            ],
        },
        {
            code: 'geo',
            show: true,
            mr: 'mr-2',
            buttons: [
                {
                    code: 'map',
                    icon: 'globe',
                    color: 'secondary',
                    active: () => FlowRouter.getRouteName() === 'map' ? 'active' : '',
                    show: true,
                },
                {
                    code: 'zoom',
                    icon: 'zoom-out',
                    color: 'light',
                    show: () => FlowRouter.getRouteName() === 'map' ? 'active' : '',
                },
                {
                    code: 'location',
                    icon: 'location',
                    color: () => {
                        const selector = { 'meta.state': { $ne: 'ready' } };
                        const is_travelling = Travels.find(selector).count() > 0;
                        const sensor = Session.get('location_sensor');
                        return  sensor === 'call' ? 'warning': 
                                sensor === 'success' ? 'success' : 
                                sensor === 'ping-pong' || sensor === 'accuracy' ? 'dark' :
                                sensor === 'error' ? 'danger' : 
                                is_travelling ? 'primary' : 'light';        
                    },
                    show: () => Meteor.userId() && navigator && navigator.geolocation && FlowRouter.getRouteName() === 'map',
                },
            ],
        },
        {
            code: 'list',
            show: true,
            mr: 'mr-2',
            buttons: [
                {
                    code: 'list',
                    icon: 'list-rich',
                    color: 'secondary',
                    active: () => FlowRouter.getRouteName() === 'list' ? 'active' : '',
                    show: true,
                },
                {
                    code: 'dashboard',
                    icon: 'bar-chart',
                    color: 'secondary',
                    active: () => FlowRouter.getRouteName() === 'dashboard' ? 'active' : '',
                    show: false,
                },
            ],
        },
        {
            code: 'participate',
            show: true,
            buttons: [
                {
                    code: 'participate',
                    icon: 'plus',
                    color: 'primary',
                    show: true,
                },
            ],
        },
    ];
});

Template.footer.helpers({
    groups() { return Template.instance().button_groups },
    show_bar() {
        const route = FlowRouter.getRouteName();
        const allowed = [ 'home', 'map', 'list', 'dashboard', 'parameters', 'participate' ];
        return _.findIndex(allowed, item => item === route) >= 0;
    },
});

Template.footer.events({
    "click #js-map"() {
        FlowRouter.go('map');
    },
    "click #js-list"() { 
        $(document).ready(function () { $('#map').hide(); });
        FlowRouter.go('list');
    },
    "click #js-dashboard"() {
        $(document).ready(function () { $('#map').hide(); });
        FlowRouter.go('dashboard');
    },
    "click #js-location"(event, template) {
        localise_me(template, true);
    },
    "click #js-participate"() {
        $(document).ready(function () { $('#map').hide(); });
        const route = FlowRouter.getRouteName();
        Session.set('come-back', route);
        if (Meteor.userId()) {
            FlowRouter.go('participate');
        } else {
            FlowRouter.go('surveys', { code: 'consents' }, { field: '0' });
        }
    },
    "click #js-account"() { 
        $(document).ready(function () { $('#map').hide(); });
        const route = FlowRouter.getRouteName();
        Session.set('come-back', route);
        FlowRouter.go('account');
    },
    "click #js-parameters"() { 
        $(document).ready(function () { $('#map').hide(); });
        const route = FlowRouter.getRouteName();
        Session.set('come-back', route);
        FlowRouter.go('parameters');
    },
    "click #js-zoom"() {
        Session.set('zoom-out', new Date());
    },
});

function location_sensor_status_will_go_to_normal(template) {
    if (template.timeout) Meteor.clearTimeout(template.timeout);
    template.timeout = Meteor.setTimeout(() => {
        Session.set('location_sensor', null);
        delete(template.timeout);
    }, __GPS_STATUS_TIMEOUT);
}

export function localise_me(template, update) {
    // Sollicitation du capteur
    Session.set('error', null);
    Session.set('location_sensor', 'call');
    const selector = { 'meta.state': { $ne: 'ready' } };
    const trip = Travels.findOne(selector);
    const last_position = _.chain(trip.data.waypoints).filter(o => o.type.code === 'location').last().value();
    navigator.geolocation.getCurrentPosition(
        pos => {
            location_sensor_status_will_go_to_normal(template);
            if (last_position && last_position.location.properties.timestamp >= pos.timestamp) {
                // Le capteur renvoie des anciennes valeurs
                Session.set('location_sensor', 'ping-pong');
                const error = {
                    msg: "Anciennes données.",
                    title: notification_title,
                    type: 'info',
                    date: new Date(),
                };
                Session.set('error', error);
                return;
            }
            // Précision suffisante
            if (pos.coords.accuracy > __ACCURACY_THRESHOLD) {
                Session.set('location_sensor', 'accuracy');
                const msg = sprintf("Le capteur de position possède une faible précision : %.1f m.", pos.coords.accuracy);
                const error = {
                    msg: msg,
                    title: notification_title,
                    type: 'info',
                    date: new Date(),
                };
                Session.set('error', error);
                return;
            }
            // Nouvelle position
            Session.set('location_sensor', 'success');
            const longitude = pos.coords.longitude;
            const latitude = pos.coords.latitude;
            const point = turf.point([longitude, latitude]);
            point.properties.accuracy = pos.coords.accuracy;
            point.properties.altitude = pos.coords.altitude;
            point.properties.altitudeAccuracy = pos.coords.altitudeAccuracy;
            point.properties.heading = pos.coords.heading;
            point.properties.speed = pos.coords.speed;
            point.properties.timestamp = pos.timestamp;
            point.properties.measuredAt = moment(pos.timestamp).local().format();
            point.properties.createdAt = new Date();
            point.properties.source = 'position-sensor';
            Session.set('location_sensor_result', point);
            Session.set('selected', { geoJSON: point });
            // Enregistrement  
            if (trip && update) {
                const last = _.last(trip.data.waypoints);
                const data = { date: point.properties.measuredAt, point: point, mode: last.mode };
                waypoint.call(data);
            }
        },
        error => {
            location_sensor_status_will_go_to_normal(template);
            Session.set('location_sensor', 'error');
            const msg = sprintf("Erreur du capteur de position : " + error.message);
            const err = {
                msg: msg,
                title: notification_title,
                type: 'danger',
            };
            Session.set('error', err);
        },
        __GPS_OPTIONS,
    );   
}
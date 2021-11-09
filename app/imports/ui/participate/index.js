import '/imports/ui/button-close';
import '/imports/ui/select-od';
import '/imports/ui/select-trajectory';
import './participate.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from '/public/moment-with-locales.min.js';
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);
import { sprintf } from 'sprintf-js';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';
import { Trajectories } from '/imports/api/trajectories/collections.js';
import { Demographies } from '/imports/api/demographies/collections.js';

import { cancel } from '/imports/api/travels/methods';
import { localise_me } from '/imports/ui/footer';
import { modes } from '/imports/variables';

Template.participate.onCreated(function () {
    const self = this;
    self.subscribe('user_profile');
    self.subscribe('travels::current');
    self.subscribe('demographies::current');
    self.indicators = [
        {
            code: 'duration',
            value: () => {
                const now = Chronos.now();
                const trip = Travels.findOne();
                if (trip) {
                    const departure = new Date(trip.data.origin.date);
                    if (departure) {
                        const seconds = (now - departure)/1000;
                        if (seconds > 0) {
                            const duration = moment.duration(seconds, "seconds").format("d[j] h[h] m[m] s[s]");
                            return duration;
                        }
                    }
                }            
            },
            unit: 'durée',
        },
        {
            code: 'distance',
            value: () => {
                const trip = Travels.findOne();
                if (trip) {
                    const last = _.last(trip.data.waypoints);
                    if (last) {
                        const d = last.distance;
                        return d < 1000 ? sprintf("%.1f", d) : sprintf("%.1f", d/1000);
                    }
                }        
            },
            unit: () => {
                const trip = Travels.findOne();
                if (trip) {
                    const last = _.last(trip.data.waypoints);
                    if (last) {
                        const d = last.distance;
                        return d < 1000 ? 'm' : 'km';
                    }
                }                        
            },
        },
        {
            code: 'speed',
            value: () => {
                const trip = Travels.findOne();
                if (trip) {
                    const last = _.last(trip.data.waypoints);
                    if (last) {
                        const start = new Date(trip.data.origin.date);
                        const end = new Date(last.date);
                        const seconds = (end-start)/1000;
                        const d = last.distance;
                        const speed = d/seconds;
                        return sprintf("%.1f", speed*3.6);
                    }
                }                        
            },
            unit: 'km/h',
        },
    ];
});

Template.participate.onRendered(function () {
    $(document).ready(function () {
        $(window).scrollTop(0);
    }); 
});

Template.participate.helpers({
    transport_state_path() {
        let isPT;
        const travel = Travels.findOne();
        if (travel) {
            const last = _.last(travel.data.waypoints);
            if (last) {
                isPT = last.mode && last.mode.isPT;
            }
        }
        return FlowRouter.path('surveys', { code: 'transport' }, { field: 0, isPT: isPT });
    },
    twitter() {
        const user = Meteor.user();
        return user && user.services && user.services.twitter;
    },
    distance() {
        const travel = Travels.findOne();
        const distance = travel.data.trajectory.properties.distance;
        return sprintf("%.0f km", distance/1000)
    },
    demo_time_ago() {
        const demography = Demographies.findOne();
        moment.locale('fr');
        return demography ? moment(demography.meta.createdAt).fromNow() : null;
    },
    indicators() { return Template.instance().indicators },
    subtitle() {
        const travel = Travels.findOne();
        return travel && travel.data.trajectory ? "Répondez à une enquête, émettez un signal ou postez un message." :
               travel ? "Afin de filtrer vos signaux et messages, sélectionnez un parcours." :
               "Vous êtes prêt à partir ? Démarrez l'enregistrement de votre déplacement."
    },
    origin() {
        const trip = Travels.findOne();
        const label = trip ? trip.data.origin.location.properties.label : undefined;
        return label;
    },    
    destination() {
        const trip = Travels.findOne();
        const label = trip ? trip.data.destination.location.properties.label : undefined;
        return label;
    },    
    origin_activity() {
        const trip = Travels.findOne();
        const label = trip ? trip.data.origin.motif.label : undefined;
        return label;
    },    
    destination_activity() {
        const trip = Travels.findOne();
        const label = trip ? trip.data.destination.motif.label : undefined;
        return label;
    },   
    state(state) {
        const trip = Travels.findOne();
        return trip && trip.meta.state === state;
    },    
    waypoints() {
        const trip = Travels.findOne();
        if (!trip || trip.data.waypoints.length === 0) return;
        return trip.data.waypoints;
        /*
        const result = _.filter(trip.data.waypoints, item => item.type.code != 'location');
        const last = _.last(trip.data.waypoints);
        if (last.type.code === 'location') result.push(last);
        return result;
        */
    },   
    demography() {
        const record = Demographies.findOne();
        if (record) {
            const data = record.data;
            let texte = 'Né en ' + data.birthYear;
            texte += ', ' + data.gender.label.toLowerCase();
            texte += ', exerçant la profession de ' + data.profession.label.toLowerCase();
            texte += ', réside';
            if (data.nbrOfPersons === 1) {
                texte += data.gender.code === 'F' ? ' seule' : ' seul';
            }
            texte += ' à ' + data.residence;
            if (data.nbrOfPersons > 1) {
                texte += ', dans un foyer de ' + data.nbrOfPersons + ' personnes';
                texte += data.nbrOfChildren === 0 ? ', sans' : ', dont ' + data.nbrOfChildren;
                texte += ' enfant';
                texte += data.nbrOfChildren <= 1 ? '' : 's';
                texte += ' de moins de 11 ans';
            }        
            const nbrVoitures = data.nbrOfVehicles === 0 ? 'aucune' : data.nbrOfVehicles;
            texte += ' et possède ' + nbrVoitures + ' voiture'
            texte += '.';
            return texte;        
        }
    },
    is_recording() { return Travels.findOne() },
    is_travelling() {
        const is_travelling = Travels.findOne({ 'meta.state': { $ne: 'ready' }});
        return is_travelling;
    },
    demo_update() {
        const record = Demographies.findOne();
        if (record) {
            const availability = __DEMOGRAPHY_NEXT_AVAILABILITY();
            const is_available = moment(record.meta.createdAt).isBefore(availability);
            return is_available;
        } else { return true }
    },
    adapt_trajectory() { return Session.get('adapt-trajectory') },
    has_trajectory() {
        const travel = Travels.findOne();
        return travel && travel.data.trajectory;
    },
});

Template.participate.events({
    "click #js-cancel"() { cancel.call() },
    "click #js-cancel-adapt"() { Session.set('adapt-trajectory', null) },
    "click #js-login"() { Meteor.loginWithTwitter() },
});

Template.participate_option.helpers({
    path() { return FlowRouter.path('surveys', { code: this.code }, { field: 0 }) },
});    

Template.localise_me.helpers({
    color: () => {
        const is_travelling = Travels.findOne({ 'meta.state': { $ne: 'ready' }});
        const sensor = Session.get('location_sensor');
        return  sensor === 'call' ? 'warning': 
                sensor === 'success' ? 'success' : 
                sensor === 'ping-pong' || sensor === 'accuracy' ? 'dark' :
                sensor === 'error' ? 'danger' : 
                is_travelling ? 'primary' : 'light';        
    },
    show: () => {
        const is_travelling = Travels.findOne({ 'meta.state': { $ne: 'ready' }});
        return navigator && navigator.geolocation && Meteor.userId() && is_travelling;
    },
});

Template.localise_me.events({
    "click #js-location"(event, template) { localise_me(template, true) },
});

Template.participate_waypoint.helpers({
    time() { return moment(this.date).format('HH:mm') },
    distance() { return sprintf("%.1f", this.distance/1000) },
    vitesse() { return this.speed ? sprintf("%.1f", this.speed*3.6) : '' },
    icon() { return this.mode.icon },
});    

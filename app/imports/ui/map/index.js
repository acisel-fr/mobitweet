import '/imports/ui/footer';
import '/imports/ui/scripts';
import './map.html';

import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from '/public/moment-with-locales.min.js';
import turf from '@turf/turf';
import _ from 'lodash';

import { get_message } from '/imports/ui/list';

import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

Template.map.onCreated(function () {
    const self = this;
    self.subscribe('travels::current');
    self.subscribe('preferences::mine', 0, 'filters');
    if (!Session.get('messages_limit')) Session.set('messages_limit', __LIMIT_MESSAGE);

    self.autorun(() => {
        let limit = Session.get('messages_limit');
        const travel = Travels.findOne();
        if (travel) return;
        self.subscribe('messages::public::unfiltered', limit);
    });

    self.autorun(() => {
        const travel = Travels.findOne();
        const pref = Preferences.findOne();
        const trajectory = travel ? travel.data.trajectory : null;
        if (!trajectory) return;
        const last = travel ? _.last(travel.data.waypoints) : null;
        const distance = last ? last.distance : 0;
    
        const buffer = pref ? pref.data.distance : 500;
        const orientation = pref ? pref.data.orientation : 30;
        const timeline = pref ? pref.data.timeline : { unit: 'days', value: 7 };
        const mode = pref && pref.data.transport && last ? last.mode.code : null;

        self.subscribe('messages::public', buffer, orientation, timeline, mode, distance, trajectory);
    });
});

Template.map.onRendered(function () {

    const self = this;

    // Suppression de la carte existante
    if($('#map').hasClass('leaflet-container')) {
        $('#map').replaceWith("<div id='map'></div>");
        delete(self.map);
    }

    // Création de la carte
    self.map = L.map(
        'map', 
        { zoomControl: false, attributionControl: false, doubleClickZoom: false }
    );
    self.map.setView(__CENTER, __ZOOM_AREA);
    L.tileLayer.provider(__TILE_PROVIDER).addTo(self.map);
    L.control.scale({ metric: true, imperial: false, position: 'topright' }).addTo(self.map);

    self.autorun(() => {
        // Afficher la carte lorsque le chemin correspond
        const route = FlowRouter.getRouteName();
        if (route === 'map') {
            $(document).ready(function () {
                $(window).scrollTop(0);
                $('#map').show();
                $(window).on(
                    "resize", 
                    function () { 
                        $("#map").height($(window).height()); 
                        if (self.map) self.map.invalidateSize(); 
                    },
                ).trigger("resize");    
            });                    
        }
    });
    
    self.autorun(() => {
        // Affichage de la trajectoire
        const travel = Travels.findOne();
        const pref = Preferences.findOne();
        const trajectory = travel ? travel.data.trajectory : undefined;
        Tracker.nonreactive(() => {
            if (self.geo) self.map.removeLayer(self.geo);
            if (self.buffer) self.map.removeLayer(self.buffer);
            if (trajectory && pref) {
                self.geo = L.geoJSON(trajectory).addTo(self.map);
                const buffer = turf.buffer(trajectory, pref.data.distance/1000);
                self.buffer = L.geoJSON(buffer, { style: { weight: 0 }}).addTo(self.map);
            }
        });
    });
    
    self.autorun(() => {
        // Zoom sur l'ensemble de la trajectoire si le bouton est pressé
        const zoom = Session.get('zoom-out');
        Tracker.nonreactive(() => {
            if (self.buffer) {
                self.map.fitBounds(self.buffer.getBounds());
            } else if (self.markers) {
                const group = L.featureGroup(self.markers);
                const bounds = group.getBounds();
                self.map.fitBounds(bounds);
            }
        });
    });


    self.autorun(() => {
        // Afficher la position de l'utilisateur lorsqu'il sollicite son capteur de position
        const geoJSON = Session.get('location_sensor_result');
        if (!geoJSON) return;
        Tracker.nonreactive(() => {            
            self.map.eachLayer(layer => { if (layer instanceof L.CircleMarker) self.map.removeLayer(layer) });
            const centroid = turf.centroid(geoJSON);
            const center = _.reverse(turf.getCoord(centroid));
            L.circleMarker(
                center, 
                { 
                    radius: __POSITION_CIRCLE_RADIUS * 2,
                    fillColor: '#007bff', 
                    fillOpacity: 0.2, 
                    weight: 0, 
                },
            ).addTo(self.map);
            L.circleMarker(
                center, 
                { 
                    radius: __POSITION_CIRCLE_RADIUS,
                    fillColor: '#007bff', 
                    fillOpacity: 1, 
                    color: '#ffffff', 
                    weight: __POSITION_CIRCLE_RADIUS / 4, 
                },
            ).addTo(self.map);
            self.map.setView(center, __ZOOM_POINT);
            Session.set('location_sensor_result', null);
        });
    });
    
    self.autorun(() => {
        // Afficher la dernière position lors de l'insertion d'un waypoint
        const geoJSON = Session.get('last-position');
        if (!geoJSON) return;
        Tracker.nonreactive(() => {            
            self.map.eachLayer(layer => { if (layer instanceof L.CircleMarker) self.map.removeLayer(layer) });
            const centroid = turf.centroid(geoJSON);
            const center = _.reverse(turf.getCoord(centroid));
            L.circleMarker(
                center, 
                { 
                    radius: __POSITION_CIRCLE_RADIUS * 2,
                    fillColor: '#007bff', 
                    fillOpacity: 0.2, 
                    weight: 0, 
                },
            ).addTo(self.map);
            L.circleMarker(
                center, 
                { 
                    radius: __POSITION_CIRCLE_RADIUS,
                    fillColor: '#007bff', 
                    fillOpacity: 1, 
                    color: '#ffffff', 
                    weight: __POSITION_CIRCLE_RADIUS / 4, 
                },
            ).addTo(self.map);
            self.map.setView(center, __ZOOM_POINT);
            Session.set('location_sensor_result', null);
        });
    });

    self.autorun(() => {
        // Notifications
        const error = Session.get('error');
        if (error && error.msg && error.type) {
            if (moment() - moment(error.date) > __NOTIFICATION_TIMEOUT) {
                Session.set('error', null);
                return;
            }
            Session.set('selected', null);
            const msg = error.msg;
            const type = error.type;
            const title = error.title ? error.title : '';
            const options = __NOTIFICATION;
            if (type === 'danger') {
                toastr.error(msg, title, options);
            } else if (type === 'warning') {
                toastr.warning(msg, title, options);
            } else if (type === 'info') {
                toastr.info(msg, title, options);
            } else if (type === 'success') {
                toastr.success(msg, title, options);
            } else {
                console.error("Type d'erreur non pris en charge par le notificateur.")
            }
        }
    });

    self.autorun(() => {
        self.markers = [];
        self.map.eachLayer(layer => { if (layer instanceof L.Circle) self.map.removeLayer(layer) });
        get_message().forEach(message => {
            const center = _.reverse(turf.getCoord(message.location));
            const marker = L.circle(
                center, 
                { 
                    radius: 50,
                    fillColor: '#007bff', 
                    fillOpacity: 0.2, 
                    weight: 2,
                    _id: message._id,
                },
            )
            .addTo(self.map)
            .bindPopup(message.message.replace(/#[^#]+$/, ''))
            .on("click", function (event) {
                const clickedCircle = event.target;
                clickedCircle.openPopup();
            });
            self.markers.push(marker);
        });
    });

    self.autorun(() => {
        const zoom = Session.get('zoom-in');
        if (zoom) {
            Tracker.nonreactive(() => {
                self.map.setView(zoom.center, zoom.zoom);
                Session.set('zoom-in', null);
                const marker = _.find(self.markers, o => o.options._id === zoom._id);
                Meteor.setTimeout(() => marker.openPopup(), 500);
            });
        }
    });
    
});
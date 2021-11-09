import './position.html';


import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import turf from '@turf/turf';

import { Travels } from '/imports/api/travels/collections.js';

import { localise_me } from '/imports/ui/footer';
import { point_on_line } from '/imports/functions';

Template.position.onCreated(function() {
    const self = this;
    self.subscribe('travels::current');
});

Template.position.onRendered(function() {
    const self = this;

    // Suppression de la carte existante
    if($('#survey_map').hasClass('leaflet-container')) {
        $('#survey_map').replaceWith("<div id='survey_map'></div>");
        delete(self.map);
    }
    
    // Création de la carte
    self.map = L.map(
        'survey_map', 
        { zoomControl: false, attributionControl: false, doubleClickZoom: false },
    );

    // Ajout des couches
    L.control.scale({ imperial: false }).addTo(self.map);
    L.tileLayer.provider(__TILE_PROVIDER).addTo(self.map);
    const travel = Travels.findOne();
    const geo = L.geoJSON(travel.data.trajectory, { style: {
        weight: 5,
    }});
    geo.addTo(self.map);
    const bounds = geo.getBounds();

    
    // Plein écran
    $(document).ready(function () {
        $(window).scrollTop(0);
        $('#survey_map').show();
        $(window).on(
            "resize", 
            function () { 
                $("#survey_map").height($(window).height()); 
                if (self.map) self.map.invalidateSize(); 
            },
        ).trigger("resize");    
        self.map.fitBounds(bounds);
    });

    // Dessin de la trajectoire
    self.map.on('click', event => {
        const longitude = event.latlng.lng;
        const latitude = event.latlng.lat;
        const selected = turf.point([longitude, latitude]);
        selected.properties.createdAt = new Date();
        selected.properties.source = 'map-click';
        Session.set('selected', { geoJSON: selected });
    });
    
    self.autorun(() => {
        const selected = Session.get('selected');
        if (!selected) return;
        const travel = Travels.findOne();
        const point = point_on_line(travel.data.trajectory, selected.geoJSON);
        refresh(self, point);
        Session.set('choose', { geoJSON: point });
    });
});

function refresh(self, point) {
    const [longitude, latitude] = turf.getCoord(point);
    if (self.point) self.map.removeLayer(self.point);
    self.point = L.circleMarker([latitude, longitude], { radius: __POSITION_CIRCLE_RADIUS }).addTo(self.map);
    const zoom = self.map.getZoom();
    self.map.setView([latitude, longitude], zoom);
}

Template.position.helpers({
    color() {
        const sensor = Session.get('location_sensor');
        return  sensor === 'call' ? 'warning': 
                sensor === 'success' ? 'success' : 
                sensor === 'ping-pong' || sensor === 'accuracy' ? 'dark' :
                sensor === 'error' ? 'danger' : 'light';        
    },
});

Template.position.events({
    "click"(event, template) { localise_me(template, false) },
});

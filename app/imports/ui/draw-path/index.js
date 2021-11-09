import './draw-path.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import turf from '@turf/turf';
import _ from 'lodash';

Template.draw_path.onCreated(function () {
    const self = this;
    self.button_groups = [
        {
            code: 'tools',
            show: true,
            label: 'Outils',
            buttons: [
                {
                    code: 'cancel',
                    icon: 'action-undo',
                    color: 'light',
                    show: true,
                    action: () => {
                        const survey = Session.get('survey');
                        if (survey && survey.trajectory && survey.trajectory.geometry.coordinates.length > 0) {
                            survey.trajectory.geometry.coordinates.pop();
                            survey.trajectory.properties.distance = turf.length(survey.trajectory, {units: 'kilometers'});
                            Session.set('survey', survey);
                            if (survey.trajectory.geometry.coordinates.length >= 1) {
                                const [longitude, latitude] = _.last(survey.trajectory.geometry.coordinates);
                                refresh(self, survey, longitude, latitude);
                            } else {
                                refresh(self, survey);
                            }
                        }
                    },
                },
                {
                    code: 'zoom-end',
                    icon: 'zoom-in',
                    color: 'light',
                    show: true,
                    action: () => {
                        const survey = Session.get('survey');
                        if (survey && survey.trajectory.geometry.coordinates.length > 0) {
                            const [longitude, latitude] = _.last(survey.trajectory.geometry.coordinates);
                            self.map.setView([latitude, longitude], 14);                
                        }
                    },
                },
                {
                    code: 'zoom-all',
                    icon: 'zoom-out',
                    color: 'light',
                    show: true,
                    action: () => {
                        const survey = Session.get('survey');
                        if (survey && survey.trajectory.geometry.coordinates.length > 0) {
                            const bounds = self.buffer.getBounds();
                            self.map.fitBounds(bounds);                    
                        }
                    },
                },
            ],
        },
    ];
});

Template.draw_path.onRendered(function() {
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
    
    // Plein écran
    const municipality = Session.get('municipality');
    const geoMunicipality = L.geoJSON(municipality);
    const bounds = geoMunicipality.getBounds();
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
    const survey = Session.get('survey');
    survey.trajectory = {
        type: "Feature",
        properties: { distance: 0 },
        geometry: {
            type: "LineString",
            coordinates: [],
        },
    };
    Session.set('survey', survey);
    self.map.on('click', event => {
        const longitude = event.latlng.lng;
        const latitude = event.latlng.lat;
        const survey = Session.get('survey');
        const last = turf.point([longitude, latitude]);
        if (survey.trajectory.geometry.coordinates.length > 0) {
            // A previous point exists
            const previous = turf.point(_.last(survey.trajectory.geometry.coordinates));
            const distance = turf.distance(previous, last, { units: 'kilometers' })
            if (distance > 20) {
                // Need Great circle
                const density = Math.round(distance/10);
                const great_circle = turf.greatCircle(previous, last, { npoints: density });
                great_circle.geometry.coordinates.shift(); // First point come from the previous action
                great_circle.geometry.coordinates.forEach(coord => survey.trajectory.geometry.coordinates.push(coord))
            } else {
                survey.trajectory.geometry.coordinates.push([longitude, latitude]);
            }
            survey.trajectory.properties.distance += distance * 1000;
        } else {
            // No point
            survey.trajectory.geometry.coordinates.push([longitude, latitude]);
        }
        // No need
        Session.set('survey', survey);
        refresh(self, survey, longitude, latitude);
    });
});

function refresh(self, survey, longitude, latitude) {
    if (self.geo) self.map.removeLayer(self.geo);
    if (self.buffer) self.map.removeLayer(self.buffer);
    if (self.point) self.map.removeLayer(self.point);
    if (longitude && latitude) {
        self.point = L.circleMarker([latitude, longitude], { radius: __POSITION_CIRCLE_RADIUS }).addTo(self.map);
        self.geo = L.geoJSON(survey.trajectory, { style: {
            weight: 5,
        }}).addTo(self.map);
        const buffer = turf.buffer(survey.trajectory, 0.05);
        self.buffer = L.geoJSON(buffer, { style: { weight: 0 }}).addTo(self.map);
        const zoom = self.map.getZoom();
        self.map.setView([latitude, longitude], zoom);
    }
}

Template.draw_path.helpers({
    groups() { return Template.instance().button_groups },
    distance() {
        const survey = Session.get('survey');
        const distance = survey && survey.trajectory && survey.trajectory.properties ? Math.round(survey.trajectory.properties.distance/1000*10)/10 : '0';
        return distance;
    },
});

Template.draw_path_button.events({
    "click"() { this.action && this.action() },
});

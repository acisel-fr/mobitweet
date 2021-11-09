import '/imports/ui/geosearch-list';
import './geosearch.html';

import { Preferences } from '/imports/api/preferences/collections.js';
const geoSearch = new Mongo.Collection('geoSearch');
const textSearch = new Mongo.Collection('textSearch');
const popularSearch = new Mongo.Collection('popularSearch');

import { surveys } from '/imports/surveys';

import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import turf from '@turf/turf';
import _ from 'lodash';

import { localise_me } from '/imports/ui/footer';

Template.geosearch.onCreated(function () {
    const self = this;

    initialise();

    self.subscriptions = [
        { 
            code: 'municipalities', 
            label: 'Communes',
            popular: 'Popular municipalities', 
            similar: 'Search a municipality by name',
            local: 'Search a municipality by location',
        },
        { 
            code: 'places', 
            label: 'Lieux-dits',
            popular: 'Popular places', 
            similar: 'Search a place by name',
            local: 'Search a place by location',
        },
        { 
            code: 'stops', 
            label: 'Arrêts',
            popular: 'Popular stops', 
            similar: 'Search a stop by name',
            local: 'Search a stop by location',
        },
    ];
    
    self.toolbar = [
        { 
            legend: {
                code: 'tools',
                label: '',
            }, 
            buttons: [
                { 
                    id: 'here', 
                    type: 'location',
                    iconic: true, 
                    color: () => {
                        const sensor = Session.get('location_sensor');
                        return  sensor === 'call' ? 'warning': 
                                sensor === 'success' ? 'success' : 
                                sensor === 'ping-pong' || sensor === 'accuracy' ? 'dark' :
                                sensor === 'error' ? 'danger' : 'light';        
                    },
                    show: () => Meteor.userId() && navigator && navigator.geolocation,                    
                    action: template => localise_me(template, true),
                },
            ],
        },
        { 
            legend: {
                code: 'view',
                label: 'affichages',
                select: true,
            }, 
            buttons: [
                { id: 'map', iconic: true, color: 'secondary', type: 'globe' },
                { id: 'list', iconic: true, color: 'secondary', type: 'list' },
            ],
        },
        { 
            legend: {
                code: 'search',
                label: 'recherches',
                select: true,
            }, 
            buttons: [
                { id: 'local', iconic: true, color: 'light', type: 'target' },
                { id: 'similar', iconic: true, color: 'light', type: 'text' },
                { id: 'recent', iconic: true, color: 'light', type: 'clock' },
                { id: 'popular', iconic: true, color: 'light', type: 'people' },
            ],
        },
    ];

    self.autorun(() => {

        console.warn('Rafraîchissement des données');

        const filter = Session.get('active_filter');
        const limit = Session.get('limit');
        if (!filter || !limit) return;

        // Suppression des anciens objets
        clean_map(self);

        const callback = () => refreshMap(self);

        const subscribe = _.find(self.subscriptions, { code: filter });

        if (Session.equals('toolbar_search', 'local')) {
            const selected = Session.get('selected');
            if (selected) self.subscribe(subscribe.local, selected.geoJSON, limit, { onReady: callback });

        } else if (Session.equals('toolbar_search', 'similar')) {
            const pattern = Session.get('pattern');
            if (pattern) self.subscribe(subscribe.similar, pattern, limit, { onReady: callback });

        } else if (Session.equals('toolbar_search', 'recent')) {
            self.subscribe('preferences::mine', limit, filter, { onReady: callback });

        } else if (Session.equals('toolbar_search', 'popular')) {
            self.subscribe(subscribe.popular, limit, { onReady: callback });
        }        

    });
});

export function initialise() {
    const task = get_task();
    if (task && task.type.code === 'geosearch') {     
        Session.set('active_filter', task.type.choose[0]);
        Session.set('toolbar_view', 'list');    
        Session.set('toolbar_search', 'similar');
        Session.set('limit', __LIMIT);
    }
    _.forEach(['pattern', 'selected', 'choose', 'alert', 'error', 'zoom'], item => Session.set(item, undefined));
    $(document).ready(function () { $('#survey_map').hide(); });
}

function clean_map(self) {
    if (self.map) {
        self.map.closePopup();
        self.map.eachLayer(layer => {
            if (layer instanceof L.GeoJSON) self.map.removeLayer(layer);
        });
    }
}

function refreshMap(self) {
    Tracker.nonreactive(() => {
        if (!(self && self.map)) return;
        const search = Session.get('toolbar_search');
        if (!search) return;
    
        console.warn('Rafraîchissement de la carte');
    
        // Suppression des anciens objets
        clean_map(self);
    
        // Récupération des résultats de recherche
        const handler = search === 'local' ? geoSearch :
                        search === 'similar' ? textSearch :
                        search === 'recent' ? Preferences :
                        search === 'popular' ? popularSearch : undefined;
        const geoObjects = handler.find().fetch();
        if (!geoObjects || geoObjects.length === 0) return;
    
        // Ajout des nouveaux objets
        let features = [];
        features = _.map(geoObjects, item => item.geoJSON);
        const geoJSON = { type: "FeatureCollection", features: features };
        const choose = Session.get('choose');
        if (choose) features.push(choose.geoJSON);
        const selected = Session.get('selected');
        L.geoJSON(geoJSON, {
            pointToLayer: (geoJsonPoint, latlng) => {
                return L.circleMarker(latlng, { radius: 5 }); // pixels
            },
            style: (geoJsonFeature) => {
                const style =   
                    choose && geoJsonFeature.properties.id === choose.geoJSON.properties.id ? 
                        { color: '#007bff', weight: 4, opacity: 1, fillColor: '#007bff', fillOpacity: 0.2 } :
                    selected && geoJsonFeature.properties.id === selected.geoJSON.properties.id ? 
                        { color: '#6c757d', weight: 4, opacity: 1, fillColor: '#6c757d', fillOpacity: 0.2 } :
                        { color: '#6c757d', weight: 1, opacity: 1, fillColor: '#6c757d', fillOpacity: 0.2 };
                return style;
            },
            onEachFeature: (feature, layer) => {
                if (choose && feature.properties.id === choose.geoJSON.properties.id) {
                    const centroid = turf.centroid(feature);
                    const center = _.reverse(turf.getCoord(centroid));
                    L.popup({ closeButton: false })
                    .setLatLng(center)
                    .setContent(feature.properties.label)
                    .openOn(self.map);
                }
            },
        }).addTo(self.map);
        if (choose && Session.get('zoom')) {
            console.warn("Zoom sur l'objet choisi");
            const centroid = turf.centroid(choose.geoJSON);
            const center = _.reverse(turf.getCoord(centroid));
            const type = choose.geoJSON.geometry.type;
            const zoom = type === 'Point' ? 15 : 11;
            self.map.setView(center, zoom);
            Session.set('zoom', undefined);        
        } else {
            console.warn("Zoom sur la liste des objets");
            const bbox = turf.bbox(geoJSON);
            const bounds = [
                [ bbox[1], bbox[0] ],
                [ bbox[3], bbox[2] ],
            ];
            self.map.fitBounds(bounds);    
        }
    });
}

Template.geosearch.onRendered(function () {
    const self = this;

    console.warn('Création de la carte');

    // Suppression de la carte existante
    if($('#survey_map').hasClass('leaflet-container')) {
        $('#survey_map').replaceWith("<div id='survey_map'></div>");
        delete(self.map);
    }

    // Création de la carte
    self.map = L.map(
        'survey_map', 
        { zoomControl: false, attributionControl: false, doubleClickZoom: false }
    );
    self.map.setView([49.5, 5.95], 10);
    L.tileLayer.provider(__TILE_PROVIDER).addTo(self.map);
    L.control.scale({ imperial: false }).addTo(self.map);
    self.map.on('click', event => {
        console.warn('Click sur la carte');
        const longitude = event.latlng.lng;
        const latitude = event.latlng.lat;
        const point = turf.point([longitude, latitude]);
        point.properties = { source: 'map-click' };
        Session.set('selected', { geoJSON: point });
    });

    self.autorun(() => {
        // Initialise à chaque changement de chemin
        console.warn('Changement de chemin');
        FlowRouter.watchPathChange();
        Tracker.nonreactive(() => { initialise() });
    });

    self.autorun(() => {
        // Transforme un élément sélectionné en un élément choisi
        const selected = Session.get('selected');
        if (!selected) return;
        Session.set('choose', undefined);
        Session.set('zoom', undefined);
        console.warn("Nouvel objet sélectionné");
        const code = FlowRouter.getParam('code');
        const field = FlowRouter.getQueryParam('field');
        const survey = _.find(surveys, { code: code });
        const task = survey.tasks[field];
        const isNotTarget =
            _.findIndex(task.type.choose, o => o === selected.geoJSON.properties.collection) === -1;
        if (isNotTarget && task.type.transform) {
            console.warn("Transformation d'un objet sélectionné en choisi");
            task.type.transform(selected);
        } else {
            console.warn("Affectation de l'objet à choisi");
            Session.set('choose', selected);
        }
    });
    
    self.autorun(() => {
        // Permute en mode carte dès qu'un élément est choisi et adapte le type de recherche
        const choose = Session.get('choose');
        if (!choose) return;
        console.warn('Nouvel objet choisi');
        Tracker.nonreactive(() => {
            if (!Session.equals('toolbar_search', 'local')) {
                Session.set('toolbar_search', 'local')
            }
            if (Session.equals('toolbar_view', 'list')) {
                console.warn('Changement en mode carte');
                Session.set('toolbar_view', 'map');
            }
            refreshMap(self);
        });
    });

    self.autorun(() => {
        if (Session.equals('toolbar_view', 'map')) {
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
                refreshMap(self);    
            });
        } else {
            $(document).ready(function () { $('#survey_map').hide(); });
        }
    });

    self.autorun(() => {
        if (Session.equals('toolbar_search', 'similar')) {
            $(document).ready(function () { $('#inputGeosearch').focus() });
        }
    });

    self.autorun(() => {
        const search = Session.get('toolbar_search');
        if (search) {
            Session.set('zoom', undefined);
        }
    });

});

Template.geosearch.helpers({
    toolbar() { return Template.instance().toolbar },
    show_filters() {
        const task = get_task();
        return task && task.type.select && task.type.select.length > 1 
    },
    filters() {
        const task = get_task();
        const filters = _.filter(Template.instance().subscriptions, item => {
            return _.findIndex(task.type.select, o => o === item.code) != -1;
        });
        return filters;
    }, 
    text_search_help() {
        const filter = Session.get('active_filter');
        const help = filter === 'municipalities' ? "fouille par commune" :
                     filter === 'places' ? "fouille par lieu-dit, code postal, aéroport, abb." :
                     filter === 'stops' ? "fouille par gare, station ou arrêt" : undefined;
        return help;
    },
    view() { return Session.equals('toolbar_view', 'list') },
    search() { return Session.equals('toolbar_search', 'similar') },
    pattern() {
        const pattern = Session.get('pattern');
        return pattern;
    },
    results_title() {
        const search = Session.get('toolbar_search');
        return search === 'local'   ? 'À proximité' :
               search === 'similar' ? 'Similaires' :
               search === 'recent'  ? 'Récents' :
               search === 'popular' ? 'Populaires' : undefined;
    },
    results() {
        const search = Session.get('toolbar_search');
        const results = search === 'local'   ? geoSearch.find() :
                        search === 'similar' ? textSearch.find() :
                        search === 'recent'  ? Preferences.find() :
                        search === 'popular' ? popularSearch.find() : undefined;
        return results;
},
});

Template.geosearch.events({
    'input #inputGeosearch'(event, template) {
        let pattern = event.currentTarget.value;
        Session.set('pattern', pattern);
    },
});

Template.filter.helpers({
    active() { return Session.get('active_filter') === this.code ? 'active' : '' },
});

Template.filter.events({
    "click"() { Session.set('active_filter', this.code) },
});

Template.tools_groups_buttons.helpers({
    active() {
        const legend = Template.parentData().legend;
        const toolbar = Session.get('toolbar_' + legend.code);
        const isActive = legend.select && toolbar === this.id;
        return isActive ? 'active' : '';
    },
    show() { return this.show ? this.show : true },
});

Template.tools_groups_buttons.events({
    'click'(event, template) {
        const legend = Template.parentData().legend;
        if (legend.select) Session.set('toolbar_' + legend.code, this.id);
        if (this.action) this.action(template);
    },
});

function get_task() {
    const code = FlowRouter.getParam('code');
    const field = FlowRouter.getQueryParam('field');
    const survey = _.find(surveys, { code: code });
    const task = survey.tasks[field];
    return task;
}

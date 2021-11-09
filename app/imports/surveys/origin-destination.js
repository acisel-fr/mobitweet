import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { insert } from '/imports/api/origins-destinations/methods';
import { contains } from '/imports/api/municipalities/methods';
import { add_preference } from '/imports/api/preferences/methods';
import { activities } from '/imports/variables';
import { modes } from '/imports/variables';

export const origin_destination = {
    code: 'origin-destination',
    tasks: [
        {
            title: 'Activité au départ',
            subtitle: "Sélectionnez votre activité au lieu de départ.",
            type: { 
                code: 'select',
                options: activities,
            },
            navbar: [
                { 
                    code: 'previous',
                    label: 'Annuler',
                    action: () => {
                        $('#survey_map').hide();
                        Session.set('survey', null);  
                        Session.set('selected', null);  
                        Session.set('municipality', null);                  
                        FlowRouter.setParams({ code: 'select-od' });
                        FlowRouter.setQueryParams({ field: 0 });
                    },
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = {
                            origin: { motif: selected },
                        };
                        Session.set('survey', survey);            
                        Session.set('selected', undefined);
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                }, 
            ],
        },
        {
            title: "Lieu de départ",
            subtitle: "Recherchez votre commune de départ.",
            type: {
                code: 'geosearch',
                choose: ['municipalities'],
                select: ['municipalities', 'places'],
                transform: (selected) => {
                    contains.call({ geoJSON: selected.geoJSON }, (error, result) => {
                        if (error) {
                            console.error(error);
                        } else {
                            Session.set('choose', result);
                        }
                    });
                },
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        const choose = Session.get('choose');
                        add_preference.call({ 
                            collection: choose.geoJSON.properties.collection, 
                            id: choose.geoJSON.properties.id, 
                            geoJSON: choose.geoJSON 
                        });
                        const survey = Session.get('survey');
                        survey.origin.location = choose.geoJSON;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 2 });
                    },
                }, 
            ], 
        },
        {
            title: "Activité à l'arrivée",
            subtitle: "Sélectionnez votre activité au lieu d'arrivée.",
            type: { 
                code: 'select',
                options: activities,
            },
            navbar: [
                { 
                    code: 'previous',
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.destination = { motif: selected };
                        Session.set('survey', survey);            
                        Session.set('selected', undefined);
                        FlowRouter.setQueryParams({ field: 3 });
                    },
                }, 
            ],
        },
        {
            title: "Lieu d'arrivée",
            subtitle: "Recherchez votre commune d'arrivée.",
            type: {
                code: 'geosearch',
                choose: ['municipalities'],
                select: ['municipalities', 'places'],
                transform: (selected) => {
                    contains.call({ geoJSON: selected.geoJSON }, (error, result) => {
                        if (error) {
                            console.error(error);
                        } else {
                            Session.set('choose', result);
                        }
                    });
                },
            },
            navbar: [
                {
                    code: 'previous', 
                },
                {
                    code: 'next', 
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        const choose = Session.get('choose');
                        add_preference.call({ 
                            collection: choose.geoJSON.properties.collection, 
                            id: choose.geoJSON.properties.id, 
                            geoJSON: choose.geoJSON 
                        });
                        const survey = Session.get('survey');
                        survey.destination.location = choose.geoJSON;
                        Session.set('survey', survey);
                        Session.set('municipality', survey.origin.location);                    
                        FlowRouter.setQueryParams({ field: 4 });
                    },
                }, 
            ],
        },
        {
            type: {
                code: 'explanation_draw_path', 
                od: () => Session.get('survey').od, 
            },
            navbar: [ { code: 'previous' }, { code: 'next', disabled: () => false } ],
        },
        {
            type: {
                code: 'draw_path',
            },
            navbar: [
                {
                    code: 'previous', 
                    action: () => {
                        $('#survey_map').hide();
                        Session.set('selected', undefined);
                        FlowRouter.setQueryParams({ field: 4 });
                    },
                },
                {
                    code: 'next', 
                    label: 'Enregistrer',
                    disabled: () => {
                        const survey = Session.get('survey');
                        const points_nbr = survey && survey.trajectory ? survey.trajectory.geometry.coordinates.length : undefined;
                        return !(points_nbr && points_nbr > 1);
                    },
                    action: () => {
                        $('#survey_map').hide();
                        Session.set('selected', undefined);
                        FlowRouter.setQueryParams({ field: 6 });
                    },
                }, 
            ],
        },
        {
            title: 'Moyen de transport',
            subtitle: "Sur ce parcours, quel est le moyen de transport principal ?",
            type: { 
                code: 'select',
                options: modes,
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.mode = selected;
                        Session.set('survey', survey);
                        Session.set('selected', undefined);
                        FlowRouter.setQueryParams({ field: 7 });
                    },
                },
            ],
        },
        {
            title: 'Libellé',
            subtitle: "Donnez un nom à ce parcours.",
            type: { 
                code: 'text',
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.label = selected;
                        insert.call(survey);          
                        Session.set('municipality', null);                                
                        Session.set('selected', undefined);
                        Session.set('survey', undefined);                    
                        FlowRouter.setParams({ code: 'select-od' });
                        FlowRouter.setQueryParams({ field: 0 });
                    },
                }, 
            ],
        },
    ],
};


import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

import { add_preference } from '/imports/api/preferences/methods';
import { board as save } from '/imports/api/travels/methods';
import { modes } from '/imports/variables';

export const board = {
    code: 'board',
    tasks: [
        {
            title: 'Moyen de transport',
            subtitle: "Vous montez dans un moyen de transport. Sélectionnez lequel.",
            type: { 
                code: 'select',
                options: _.slice(modes, 1),
            },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => quit(),
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        Session.set('survey', { mode: selected });
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
            ],
        },
        {
            title: 'Heure de montée',
            subtitle: "À quelle heure êtes-vous monté ?",
            type: {
                code: 'datetime',
            },
            navbar: [
                { code: 'previous' },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.date = selected;
                        Session.set('survey', survey);
                        if (survey.mode.isPT) {
                            FlowRouter.setQueryParams({ field: 2 });
                        } else {
                            FlowRouter.setQueryParams({ field: 4 });
                        }
                    },
                },
            ],
        },
        {
            title: 'Arrêt de montée',
            subtitle: "À quel arrêt êtes-vous monté ?",
            type: {
                code: 'geosearch',
                choose: ['stops'],
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
                        survey.location = choose.geoJSON;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 3 });
                    },
                }, 
            ],
        },
        {
            title: 'Terminus',
            subtitle: "Quel est le terminus de votre ligne ?",
            type: {
                code: 'geosearch',
                choose: ['stops'],
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
                        survey.mode.terminus = choose.geoJSON;
                        save.call(survey);
                        quit();
                    },
                }, 
            ],
        },
        {
            type: {
                code: 'explanation_board',
            },
            navbar: [
                {
                    code: 'previous',
                    action: () => {
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
                {
                    code: 'next',
                    disabled: () => false,
                }, 
            ],
        },
        {
            type: {
                code: 'position',
            },
            navbar: [
                {
                    code: 'previous',
                    action: () => {
                        $('#survey_map').hide();
                        FlowRouter.setQueryParams({ field: 4 });
                    },
                },
                {
                    code: 'next',
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        const choose = Session.get('choose');
                        const survey = Session.get('survey');
                        survey.location = choose.geoJSON;
                        save.call(survey);
                        quit();
                    },
                }, 
            ],
        },
    ],
};

function quit() { 
    $('#survey_map').hide();
    Session.set('choose', undefined);
    Session.set('selected', undefined);
    Session.set('survey', undefined);        
    FlowRouter.go('participate');
}

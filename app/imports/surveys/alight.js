import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { add_preference } from '/imports/api/preferences/methods';
import { alight as save } from '/imports/api/travels/methods';

export const alight = {
    code: 'alight',
    tasks: [
        {
            title: 'Heure de descente',
            subtitle: "À quelle heure êtes-vous descendu ?",
            type: {
                code: 'datetime',
            },
            navbar: [
                { 
                    code: 'previous', 
                    label: 'Annuler',
                    action: () => quit(),
                },
                {
                    code: 'next',
                    action: (measure) => {
                        const selected = Session.get('selected');
                        survey.date = selected;
                        Session.set('survey', { date: selected });
                        const last = _.last(measure.data.waypoints);
                        if (last.mode.isPT) {
                            FlowRouter.setQueryParams({ field: 1 });
                        } else {
                            FlowRouter.setQueryParams({ field: 2 });
                        }
                
                    },
                },
            ],
        },
        {
            title: 'Arrêt de descente',
            subtitle: "À quel arrêt êtes-vous descendu ?",
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
                        survey.point = choose.geoJSON;
                        save.call(survey)
                        quit();
                    },
                }, 
            ],
        },
        {
            type: {
                code: 'explanation_alight',
            },
            navbar: [
                {
                    code: 'previous',
                    action: () => {
                        FlowRouter.setQueryParams({ field: 0 });
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
                        survey.point = choose.geoJSON;
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

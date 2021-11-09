import { FlowRouter } from 'meteor/kadira:flow-router';

import { start_survey } from '/imports/api/travels/methods';
import { add_trajectory } from '/imports/api/travels/methods';

export const select_od = {
    code: 'select-od',
    tasks: [
        {
            title: 'Déplacement',
            subtitle: "Sélectionnez un déplacement régulier.",
            type: {
                code: 'select_od',
            },
            navbar: [
                { code: 'previous', label: 'Annuler', action: () => FlowRouter.go('participate') },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        Session.set('survey', selected)
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
            ],
        },
        {
            title: 'Parcours',
            subtitle: "Sélectionnez un parcours pour le déplacement choisi.",
            type: {
                code: 'select_trajectory',
            },
            navbar: [
                { code: 'previous' },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        start_survey.call({ origin: survey.origin, destination: survey.destination, odId: survey.odId }, (error, travelId) => {
                            if (error) {
                                console.error(error);
                            } else {
                                add_trajectory.call({ trajectory: selected.geoJSON, travelId: travelId }, (error) => {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        FlowRouter.go('participate');               
                                    }
                                });                
                            }
                        }); 
                    },
                },
            ],
        },
    ],
};

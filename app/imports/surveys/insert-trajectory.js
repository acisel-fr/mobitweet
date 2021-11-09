import { FlowRouter } from 'meteor/kadira:flow-router';

import { insert_back_and_forth } from '/imports/api/trajectories/methods';
import { add_preference } from '/imports/api/preferences/methods';
import { modes } from '/imports/variables';

export const insert_trajectory = {
    code: 'insert-trajectory',
    tasks: [
        {
            type: {
                code: 'explanation_draw_path', 
            },
            navbar: [ 
                { 
                    code: 'previous',
                    label: 'Annuler',
                    action: () => {
                        Session.set('municipality', undefined);
                        Session.set('selected', undefined);
                        Session.set('survey', undefined);                    
                        FlowRouter.go('surveys', { code: 'select-od' }, { field: 1 });
                    },
                }, 
                { 
                    code: 'next', 
                    disabled: () => false,
                    action: () => {
                        const survey = Session.get('survey');
                        Session.set('municipality', survey.origin.location);
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                }, 
            ],
        },
        {
            type: {
                code: 'draw_path',
            },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => {
                        $('#survey_map').hide();
                        Session.set('survey', null);
                        Session.set('selected', null);
                        FlowRouter.setQueryParams({ field: 0 });
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
                        FlowRouter.setQueryParams({ field: 2 });
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
                        FlowRouter.setQueryParams({ field: 3 });
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
                        insert_back_and_forth.call({ odId: survey.odId, label: selected, mode: survey.mode, trajectory: survey.trajectory });                  
                        delete(survey.mode)                     
                        delete(survey.trajectory)
                        Session.set('survey', survey);                     
                        Session.set('municipality', undefined);
                        Session.set('selected', undefined);
                        FlowRouter.go('surveys', { code: 'select-od' }, { field: 1 });
                    },
                }, 
            ],
        },
    ],
};

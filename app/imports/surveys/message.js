import { FlowRouter } from 'meteor/kadira:flow-router';

import { themes } from '/imports/variables';
import { emit_message } from '/imports/api/messages/methods';

export const message = {
    code: 'message',
    tasks : [
        {
            title: 'Thème',
            subtitle: "Sélectionnez le thème principal de votre message.",
            type: { 
                code: 'select',
                options: themes,
            },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => { 
                        Session.set('selected', undefined);
                        Session.set('survey', undefined);        
                        FlowRouter.go('participate');
                    },
                },
                {
                    code: 'next',
                    action: () => {
                        const selected = Session.get('selected');
                        Session.set('survey', { theme: selected });
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
            ],
        },
        {
            type: {
                code: 'explanation_message',
            },
            navbar: [
                {
                    code: 'previous',
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
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
                {
                    code: 'next',
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        const choose = Session.get('choose');
                        const survey = Session.get('survey');
                        survey.location = choose.geoJSON;
                        Session.set('choose', null);
                        Session.set('selected', null);
                        Session.set('survey', survey);
                        $('#survey_map').hide();
                        FlowRouter.setQueryParams({ field: 3 });
                    },
                }, 
            ],
        },        
        {
            title: 'Mon message',
            subtitle: "Saisissez le texte de votre message.",
            type: { 
                code: 'message',
                rows: 6,
                append: () => {
                    const survey = Session.get('survey');
                    const code = survey ? survey.theme.code : '';
                    return `#${code}, via @mobitweet_`;
                },
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    label: 'Enregistrer',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.message = selected;
                        Session.set('survey', survey);
                        emit_message.call(survey, error => {
                            if (error) {
                                console.error(error);
                            } else {
                                Session.set('selected', undefined);
                                Session.set('survey', undefined);        
                                FlowRouter.go('list');
                            }
                        });
                    },
                },
            ],
        },
   ],    
};

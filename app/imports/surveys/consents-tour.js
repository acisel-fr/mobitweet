import { FlowRouter } from 'meteor/kadira:flow-router';

export const consents_tour = {
    code: 'consents-tour',
    tasks: [
        {
            type: { code: 'about' },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => quit(),
                },
                { code: 'next', disabled: () => false }, 
            ],
        },
        {
            type: { code: 'consent_storage' },
            navbar: [ { code: 'previous' }, { code: 'next', disabled: () => false } ],
        },
        {
            type: { code: 'consent_production' },
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
            type: { code: 'consent_geolocation' },
            navbar: [ { code: 'previous' }, { code: 'next', disabled: () => false } ],
        },
        {
            type: { code: 'consent_authentication' },
            navbar: [ { code: 'previous' }, { code: 'next', disabled: () => false } ],
        },
        {
            type: { code: 'consent_legal_mentions' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    label: 'Fin',
                    disabled: () => false,
                    action: () => quit(),
                }, 
            ],
        },
   ],
};

function quit() {
    const route = Session.get('come-back') || 'home';
    FlowRouter.go(route);
}
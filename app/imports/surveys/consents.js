import { FlowRouter } from 'meteor/kadira:flow-router';

export const consents = {
    code: 'consents',
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
            type: { code: 'consents' },
            navbar: [ { code: 'previous' }, { code: 'next', disabled: () => false } ],
        },
        {
            type: { code: 'consent_storage' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    color: 'success',
                    label: 'Je consens',
                    disabled: () => false,
                }, 
            ],
        },
        {
            type: { code: 'consent_production' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    color: 'success',
                    label: 'Je consens',
                    disabled: () => false,
                }, 
            ],
        },
        {
            type: { code: 'consent_geolocation' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    color: 'success',
                    label: 'Je consens',
                    disabled: () => false,
                }, 
            ],
        },
        {
            type: { code: 'consent_authentication' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    color: 'success',
                    label: 'Je consens',
                    disabled: () => false,
                }, 
            ],
        },
        {
            type: { code: 'consent_legal_mentions' },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next', 
                    color: 'success',
                    label: 'Je consens',
                    disabled: () => false,
                    action: () => FlowRouter.go('authentication'),
                }, 
            ],
        },
   ],
};

function quit() {
    const route = Session.get('come-back') || 'home';
    FlowRouter.go(route);
}
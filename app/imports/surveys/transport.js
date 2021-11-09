import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { emit_signal as save } from '/imports/api/messages/methods';

export const transport_state = {
    code: 'transport',
    tasks: [
        {
            type: {
                code: 'explanation_signal',
            },
            navbar: [
                {
                    code: 'previous',
                    label: 'Annuler',
                    action: () => {
                        Session.set('choose', undefined);
                        Session.set('selected', undefined);
                        Session.set('survey', undefined);        
                        FlowRouter.go('participate');
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
                        FlowRouter.setQueryParams({ field: 0 });
                    },
                },
                {
                    code: 'next',
                    disabled: () => !Session.get('choose'),
                    action: () => {
                        $('#survey_map').hide();
                        const choose = Session.get('choose');
                        const isPT = FlowRouter.getQueryParam('isPT');
                        const survey = Session.set('survey', { 
                            location: choose.geoJSON,
                            isPT: isPT,
                        });
                        if (isPT) {
                            FlowRouter.setQueryParams({ field: 2 });
                        } else {
                            FlowRouter.setQueryParams({ field: 13 });
                        }
                    },
                }, 
            ],
        },  
        {
            title: "Itinéraire",
            subtitle: "Circulez-vous sur l'itinéraire habituel ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Itinéraire habituel' },
                    { code: 'no', label: "Changement d'itinéraire" },
                    { code: 'nsp', label: 'Je ne sais pas' },
                ],
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
                        survey.itinerary = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 3 });
                    },
                },
            ],
        },
        {
            title: "Annulation",
            subtitle: "Votre service a-t-il été annulé ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Service habituel' },
                    { code: 'no', label: "Service annulé" },
                    { code: 'nsp', label: 'Je ne sais pas' },
                ],
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
                        survey.cancelation = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 4 });
                    },
                },
            ],
        },
        {
            title: "Retard",
            subtitle: "Votre service est-il en retard ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Service à l'heure" },
                    { code: 'no', label: "Service en retard" },
                    { code: 'nsp', label: 'Je ne sais pas' },
                ],
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
                        survey.delays = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 5 });
                    },
                },
            ],
        },        {
            title: "Posture",
            subtitle: "Êtes-vous actullement assis ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Je voyage assis' },
                    { code: 'no', label: "Je n'ai pas trouvé de place assise" },
                    { code: 'na', label: 'Je suis très bien debout' },
                ],
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
                        survey.posture = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 6 });
                    },
                },
            ],
        },
        {
            title: "Places assises",
            subtitle: "Depuis votre place, combien voyez-vous des places assises ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Plusieurs places assises disponibles' },
                    { code: 'no', label: 'Aucune place assise disponible' },
                ],
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
                        survey.seats = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 7 });
                    },
                },
            ],
        },
        {
            title: "Gens debout",
            subtitle: "Depuis votre place, voyez-vous de personnes debouts ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Presque tout le monde est assis' },
                    { code: 'no', label: 'Le véhicule est bondé' },
                ],
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
                        survey.overcrowd = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 8 });
                    },
                },
            ],
        },    
        {
            title: "Voisinage",
            subtitle: "Comment sont vos voisins ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Tout le monde est calme' },
                    { code: 'no', label: "Mes voisins sont ennervés ou bruyants" },
                    { code: 'na', label: "Je suis tout seul" },
                ],
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
                        survey.neighbourhood = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 9 });
                    },
                },
            ],
        },
        {
            title: "Éclairage",
            subtitle: "Comment trouvez-vous l'éclairage ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'La luminosité est parfaite' },
                    { code: 'no', label: "Il y a trop ou pas assez de lumière" },
                ],
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
                        survey.light = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 10 });
                    },
                },
            ],
        },
        {
            title: "Température",
            subtitle: "Comment trouvez-vous la température ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "La température est parfaite" },
                    { code: 'no', label: "Il fait trop chaud ou trop froid" },
                ],
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
                        survey.temperature = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 11 });
                    },
                },
            ],
        },
        {
            title: "Odeurs",
            subtitle: "Sentez-vous des odeurs ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Il n'y a pas d'odeur particulière" },
                    { code: 'no', label: "Les odeurs sont désagréables" },
                ],
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
                        survey.smell = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 12 });
                    },
                },
            ],
        },
        {
            title: "Toilettes",
            subtitle: "Avez-vous vu des toilettes ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Il y a un toilette fonctionnel' },
                    { code: 'no', label: "Il n'y a pas de toilette" },
                    { code: 'nsp', label: 'Je ne sais pas' },
                ],
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
                        survey.toilettes = selected;
                        Session.set('survey', survey);
                        save.call({ survey: survey }, (error, result) => {
                            if (error) {
                                throw new Error(error);
                            } else {
                                Session.set('choose', undefined);
                                Session.set('selected', undefined);
                                Session.set('survey', undefined);        
                                FlowRouter.go('list');
                            }
                        });                    
                    },
                },
            ],
        },
        {
            title: "Avancement",
            subtitle: "Avancez-vous sans gêne ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "J'avance" },
                    { code: 'no', label: "Je suis bloqué" },
                ],
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
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        survey.jam = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 14 });
                    },
                },
            ],
        },   
        {
            title: "Vitesse",
            subtitle: "Votre vitesse est-elle satisfaisante ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Vitesse parfaite" },
                    { code: 'no', label: "Ralentissement" },
                ],
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
                        survey.speed = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 15 });
                    },
                },
            ],
        },  
        {
            title: "Itinéraire",
            subtitle: "Êtes-vous sur votre itinéraire habituel ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Itinéraire habituel" },
                    { code: 'no', label: "Itinéraire dévié" },
                ],
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
                        survey.itinerary = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 16 });
                    },
                },
            ],
        },  
        {
            title: "Stationnement",
            subtitle: "Avez-vous un problème pour stationner ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Stationnement parfait" },
                    { code: 'no', label: "Je ne peux pas stationner" },
                    { code: 'na', label: "Pas besoin de stationnement" },
                ],
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
                        survey.parking = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 17 });
                    },
                },
            ],
        },
        {
            title: "Chaussée",
            subtitle: "Quel est l'état de la chaussée ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Chaussée en bon état" },
                    { code: 'no', label: "Chaussée en mauvaise état" },
                ],
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
                        survey.road = selected;
                        Session.set('survey', survey);
                        FlowRouter.setQueryParams({ field: 18 });
                    },
                },
            ],
        },
        {
            title: "Danger",
            subtitle: "Constatez-vous un danger ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Tout va bien" },
                    { code: 'no', label: "Présence d'un danger" },
                ],
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
                        survey.danger = selected;
                        Session.set('survey', survey);
                        save.call({ survey: survey }, (error, result) => {
                            if (error) {
                                throw new Error(error);
                            } else {
                                Session.set('choose', undefined);
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

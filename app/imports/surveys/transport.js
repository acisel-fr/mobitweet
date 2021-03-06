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
            title: "Itin??raire",
            subtitle: "Circulez-vous sur l'itin??raire habituel ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Itin??raire habituel' },
                    { code: 'no', label: "Changement d'itin??raire" },
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
            subtitle: "Votre service a-t-il ??t?? annul?? ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Service habituel' },
                    { code: 'no', label: "Service annul??" },
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
                    { code: 'ok', label: "Service ?? l'heure" },
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
            subtitle: "??tes-vous actullement assis ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'Je voyage assis' },
                    { code: 'no', label: "Je n'ai pas trouv?? de place assise" },
                    { code: 'na', label: 'Je suis tr??s bien debout' },
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
                    { code: 'no', label: 'Le v??hicule est bond??' },
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
                    { code: 'no', label: "Mes voisins sont ennerv??s ou bruyants" },
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
            title: "??clairage",
            subtitle: "Comment trouvez-vous l'??clairage ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: 'La luminosit?? est parfaite' },
                    { code: 'no', label: "Il y a trop ou pas assez de lumi??re" },
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
            title: "Temp??rature",
            subtitle: "Comment trouvez-vous la temp??rature ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "La temp??rature est parfaite" },
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
                    { code: 'ok', label: "Il n'y a pas d'odeur particuli??re" },
                    { code: 'no', label: "Les odeurs sont d??sagr??ables" },
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
            subtitle: "Avancez-vous sans g??ne ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "J'avance" },
                    { code: 'no', label: "Je suis bloqu??" },
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
            title: "Itin??raire",
            subtitle: "??tes-vous sur votre itin??raire habituel ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Itin??raire habituel" },
                    { code: 'no', label: "Itin??raire d??vi??" },
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
            subtitle: "Avez-vous un probl??me pour stationner ?",
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
            title: "Chauss??e",
            subtitle: "Quel est l'??tat de la chauss??e ?",
            type: {
                code: 'select',
                options: [
                    { code: 'ok', label: "Chauss??e en bon ??tat" },
                    { code: 'no', label: "Chauss??e en mauvaise ??tat" },
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
                    { code: 'no', label: "Pr??sence d'un danger" },
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

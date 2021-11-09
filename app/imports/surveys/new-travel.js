import { Travels } from '/imports/api/travels/collections.js';

import { departure as save } from '/imports/api/travels/methods';

import { FlowRouter } from 'meteor/kadira:flow-router';

import { sprintf } from 'sprintf-js';
import turf from '@turf/turf';
import moment from '/public/moment-with-locales.min.js';
moment.locale('fr');
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

export const new_travel = {
    code: 'new-travel',
    tasks: [
        {
            title: 'Départ',
            subtitle: "Indiquez votre date de départ.",
            type: {
                code: 'datetime',
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
                    errors: () => {
                        const selected = Session.get('selected');
                        const now = moment().add(1, 'minutes');
                        const yesterday = moment().subtract(1, 'days');
                        const error = 
                            moment(selected).isAfter(now) ? `Les voyages dans le futur ne sont pas encore possibles. Veuillez saisir une date passée.` : 
                            moment(selected).isBefore(yesterday) ? "Cette date est trop éloignée dans le passé." : 
                            undefined;
                        return error;
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        Session.set('survey', { departure: selected });
                        FlowRouter.setQueryParams({ field: 1 });
                    },
                },
            ],
        },
        {
            title: "Contrainte horaire",
            subtitle: "Indiquez votre contrainte horaire à l'arrivée.",
            type: {
                code: 'select',
                options: [
                    { code: 'flexible', label: 'Flexible' },
                    { code: 'constraint', label: 'Limitée' },
                ],
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    label: () => Session.get('selected') && Session.get('selected').code === 'flexible' ? 'Enregistrer' : 'Suivant',
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        if (selected.code === 'flexible') {
                            save.call({ departure: survey.departure, constraint: selected });
                            Session.set('selected', undefined);
                            Session.set('survey', undefined);        
                            FlowRouter.go('map');
                        
                        } else {
                            survey.constraint = selected;
                            Session.set('survey', survey);
                            FlowRouter.setQueryParams({ field: 2 });
                        }
                    },
                },
            ],
        },
        {
            title: "Arrivée",
            subtitle: "Indiquez la date d'arrivée à respecter.",
            type: {
                code: 'datetime',
            },
            navbar: [
                {
                    code: 'previous',
                },
                {
                    code: 'next',
                    label: 'Enregistrer',
                    errors: (measure) => {
                        const survey = Session.get('survey');
                        const selected = Session.get('selected');
                        const milliseconds = moment(selected) - moment(survey.departure);
                        if (milliseconds < 0) return "Veuillez saisir une heure supérieure à votre heure de départ.";
                        const duration = moment.duration(milliseconds, "milliseconds").format("d [jours], h [heures] et m [minutes]");
                        const from = turf.centroid(measure.data.origin.location);
                        const to = turf.centroid(measure.data.destination.location);
                        const distance = turf.distance(from, to, { units: 'kilometers' });
                        const hours = milliseconds/1000/3600;
                        const speed = distance/hours;
                        const error = 
                            distance > 5 && speed > 500 ? sprintf("Vous circulez beaucoup trop vite : %d km en %s, soit %d km/h. Veuillez corriger vos dates de départ et d'arrivée.", distance.toFixed(0), duration, speed.toFixed(0)) :
                            distance > 5 && speed < 2   ? sprintf("Vous circulez très lentement : %d km en %s, soit %d km/h. Veuillez corriger vos dates de départ et d'arrivée.", distance.toFixed(0), duration, speed.toFixed(0)) :
                            undefined;
                        return error;
                    },
                    action: () => {
                        const selected = Session.get('selected');
                        const survey = Session.get('survey');
                        save.call({ departure: survey.departure, constraint: survey.constraint, arrival: selected});
                        Session.set('selected', undefined);
                        Session.set('survey', undefined);        
                        FlowRouter.go('map');                    
                    },
                },    
            ],
        },
    ],
};

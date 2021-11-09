import { Travels } from '/imports/api/travels/collections.js';

import { arrival as save } from '/imports/api/travels/methods';

import { FlowRouter } from 'meteor/kadira:flow-router';

import { sprintf } from 'sprintf-js';
import turf from '@turf/turf';
import moment from '/public/moment-with-locales.min.js';
moment.locale('fr');
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

export const arrival = {
    code: 'arrival',
    tasks: [
        {
            title: 'Arrivée',
            subtitle: "Vous êtes arrivés à destination. Indiquez la date d'arrivée.",
            type: {
                code: 'datetime',
            },
            navbar: [
                { 
                    code: 'previous',
                    label: 'Annuler',
                    action: () => {
                        Session.set('selected', undefined);
                        FlowRouter.go('participate') 
                    },
                },
                { 
                    code: 'next',
                    label: 'Enregistrer',
                    errors: (measure) => {
                        const selected = Session.get('selected');
                        let error;
                        const now = moment().add(1, 'minutes');
                        error = moment(selected).isAfter(now) ? `Les voyages dans le futur ne sont pas encore possibles. Veuillez saisir une date passée.` : undefined;
                        if (error) return error;
                        const milliseconds = moment(selected) - moment(measure.data.origin.date);
                        if (milliseconds < 0) return "Veuillez saisir une heure supérieure à votre heure de départ.";
                        const duration = moment.duration(milliseconds, "milliseconds").format("d [jours], h [heures] et m [minutes]");
                        const from = turf.centroid(measure.data.origin.location);
                        const to = turf.centroid(measure.data.destination.location);
                        const distance = turf.distance(from, to, { units: 'kilometers' });
                        const hours = milliseconds/1000/3600;
                        const speed = distance/hours;
                        error = 
                            distance > 5 && speed > 500 ? sprintf("Vous circulez beaucoup trop vite : %d km en %s, soit %d km/h. Veuillez corriger vos dates de départ et d'arrivée.", distance.toFixed(0), duration, speed.toFixed(0)) :
                            distance > 5 && speed < 2   ? sprintf("Vous circulez très lentement : %d km en %s, soit %d km/h. Veuillez corriger vos dates de départ et d'arrivée.", distance.toFixed(0), duration, speed.toFixed(0)) :
                            undefined;
                        return error;
                    },        
                    action: () => {
                        const selected = Session.get('selected');
                        save.call({ arrival: selected });
                        FlowRouter.go('participate');
                    },
                }, 

            ],
        },
    ],
};

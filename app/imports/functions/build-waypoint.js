import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import moment from '/public/moment-with-locales.min.js';
import { sprintf } from 'sprintf-js';
import turf from '@turf/turf';
import _ from 'lodash';

import { point_on_line } from '/imports/functions';

export function build_waypoint({last, type, date, point, mode, trajectory}) {

    if (type.code != 'departure') check(last, Object);
    check(type, Object);
    check(date, String);
    point = !point && type.code === 'departure' ? turf.point(_.first(trajectory.geometry.coordinates), { source: 'trajectory' }) :
            !point && type.code === 'arrival'   ? turf.point(_.last(trajectory.geometry.coordinates), { source: 'trajectory' })  :
            point;
    check(point, Object);
    check(mode, Object);
    check(trajectory, Object);


    const waypoint = {
        id: Random.id(),
        createdAt: new Date(),
        type: type,
        date: date,
        location: point,
        mode: mode,
        distance: type.code === 'departure' ? 0 : type.code === 'arrival' ? trajectory.properties.distance : null,
        speed: 0,
        acceleration: 0,
        bearing: null,
        orientation: null,
    };

    if (Meteor.isClient) Session.set('error', null);

    // Fixe la position actuelle
    if (point && Meteor.isClient) Session.set('last-position', point);

    // Les dates de relevé doivent être croissantes
    if (last) {
        const precedence = moment(last.date).isBefore(date);
        if (!precedence) {
            if (Meteor.isClient) {
                const error = {
                    msg: "La date de la mesure est antécédente au dernier relevé.",
                    type: 'danger',
                    date: new Date(),
                };
                Session.set('error', error);
            }
            return;
        }
    }

    // Calcul de la distance
    const pointOnLine = point_on_line(trajectory, point);

    if (!pointOnLine) return;

    const distance = pointOnLine.properties.distance;
    waypoint.distance = distance;
    waypoint.bearing = pointOnLine.properties.bearing;
    waypoint.orientation = pointOnLine.properties.orientation;

    // Test de l'avancée constante
    if (last && distance < last.distance) {
        if (Meteor.isClient) {
            const error = {
                msg: "Il semblerait que vous soyez en train de reculer.",
                type: point.properties.source === 'position-sensor' ? 'danger' : 'warning',
                date: new Date(),
            };
            Session.set('error', error);
        }
        if (last.distance - distance > 500) return;
    }

    if (last) {

        // Calcul de la vitesse en m/s
        const milliseconds = moment(date) - moment(last.date);
        const duration = milliseconds / 1000;
        const speed = (waypoint.distance - last.distance) / duration;
        waypoint.speed = speed;

        if (speed > last.mode.max_speed) {
            if (Meteor.isClient) {
                const msg = sprintf(
                    "Votre vitesse (%.1f km/h sur une distance de %.1f m) semble excessive au regard de votre moyen de transport (%s).", speed*3.6, waypoint.distance - last.distance, last.mode.label
                );
                const error = {
                    msg: msg,
                    type: 'danger',
                    date: new Date(),
                };
                Session.set('error', error);
            }
            return;
        }

        // Calcul de l'accélération en m/s2
        waypoint.acceleration = duration > 0 ? (waypoint.speed - last.speed) / duration : null;

    }    

    return waypoint;

}


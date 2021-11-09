import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import turf from '@turf/turf';
import _ from 'lodash';
import moment from '/public/moment-with-locales.min.js';

import { Messages } from '/imports/api/messages/collections.js';

import { point_on_line } from '/imports/functions';

Meteor.publish('messages::public', function (buffer_width, bearing_offset, timeline, mode, distance, trajectory) {

    const self = this;

    const userId = this.userId;
    if (!userId) { return this.ready() }

    check(buffer_width, Number);
    check(bearing_offset, Number);
    check(timeline, Object);
    if (mode) check(mode, String);
    if (distance) check(distance, Number);
    check(trajectory, Object);

    if (!Meteor.isServer) return;
    
    const selector = {};

    if (buffer_width > 0) {
        buffer_width /= 1000;
        const buffer = turf.buffer(trajectory, buffer_width, { units: 'kilometers' });
        selector['geoJSON.geometry'] = {
            $geoIntersects: {
                $geometry: buffer.geometry,
            },
        };
    };

    if (timeline.value > 0) {
        const date = moment().subtract(timeline.value, timeline.unit).format();
        selector['data.date'] = { $gt: date };
    } 

    if (mode) selector['data.mode.code'] = mode;

    Messages.rawCollection().find(selector).forEach(item => {
        const pointOnLine = point_on_line(trajectory, item.geoJSON);
        if (pointOnLine) {
            const diff = Math.abs(pointOnLine.properties.bearing - item.data.bearing);
            if (bearing_offset === -1 || diff < bearing_offset) {
                const record = {
                    id: item.meta.id,
                    location: item.geoJSON,
                    along: pointOnLine.properties.distance,
                    ordonnee: pointOnLine.properties.distance - distance,
                    orientation: pointOnLine.properties.orientation,
                    bearing: item.data.bearing,
                    date: item.data.date,
                    message: item.data.message,
                    theme: item.data.theme,
                    mode: item.data.mode.code,
                    user: item.data.user,
                    userId: item.meta.userId,
                };
                self.added('messages', Random.id(), record)
            }
        }
    })

});

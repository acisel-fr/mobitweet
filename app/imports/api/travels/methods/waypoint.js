import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

import { GeoPoint, Mode } from '/imports/schemas';
import { build_waypoint } from '/imports/functions';

export const waypoint = new ValidatedMethod({
    name: 'travels::waypoint',

    validate: new SimpleSchema({
        date: { type: String },
        point: { type: GeoPoint },
        mode: { type: Mode },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ date, point, mode }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 
            'meta.userId': userId, 
            'meta.state': { $nin: [ 'completed', 'cancelled' ] },
        };
        
        const modifier = { 
            $set: { 
                'meta.updatedAt': new Date(), 
            }, 
        };    
        
        const trip = Travels.findOne(selector);
        const last = _.last(trip.data.waypoints);        
        const builder = {
            last: last, 
            type: { code: 'location', label: 'Position' }, 
            date: date, 
            point: point, 
            mode: mode, 
            trajectory: trip.data.trajectory,
        };
        const waypoint = build_waypoint(builder);
        if (waypoint) modifier.$push = {
            'data.waypoints': waypoint,
        }

        Travels.update(selector, modifier);

    },
});

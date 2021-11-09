import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

import { GeoPoint } from '/imports/schemas';
import { build_waypoint } from '/imports/functions';
import { modes } from '/imports/variables';

export const alight = new ValidatedMethod({
    name: 'travels::alight',

    validate: new SimpleSchema({
        date: { type: String },
        point: { type: GeoPoint },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ date, point }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 
            'meta.userId': userId, 
            'meta.state': { $nin: [ 'completed', 'cancelled' ] },
        };

        const trip = Travels.findOne(selector);
        const last = _.last(trip.data.waypoints);        
        const builder = {
            last: last, 
            type: { code: 'alight', label: 'Descente' }, 
            date: date, 
            point: point, 
            mode: modes[0], 
            trajectory: trip.data.trajectory,
        };
        const waypoint = build_waypoint(builder);

        if (waypoint) {

            const modifier = { 
                $set: { 
                    'meta.updatedAt': new Date(), 
                    'meta.state': 'walking',
                },
                $push: {
                    'data.waypoints': waypoint,
                },
            };    

            Travels.update(selector, modifier, (error) => {
                if (error) console.error(error);
            });
            
        }

    },
});

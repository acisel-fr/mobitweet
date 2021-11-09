import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

import { Mode, GeoPoint } from '/imports/schemas';
import { build_waypoint } from '/imports/functions';

export const board = new ValidatedMethod({
    name: 'travels::board',

    validate: new SimpleSchema({
        mode: { type: Mode },
        date: { type: String },
        location: { type: GeoPoint },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ mode, date, location }) {

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
            type: { code: 'board', label: 'Montée' }, 
            date: date, 
            point: location, 
            mode: mode, 
            trajectory: trip.data.trajectory,
        };
        const waypoint = build_waypoint(builder);

        if (waypoint) {

            const modifier = { 
                $set: { 
                    'meta.updatedAt': new Date(), 
                    'meta.state': 'travelling',
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

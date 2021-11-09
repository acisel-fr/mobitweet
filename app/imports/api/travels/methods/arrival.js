import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

import { build_waypoint } from '/imports/functions';
import { modes } from '/imports/variables';

export const arrival = new ValidatedMethod({
    name: 'travels::arrival',

    validate: new SimpleSchema({
        arrival: { type: String },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ arrival }) {

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
            type: { code: 'arrival', label: 'Arrivée' }, 
            date: arrival,
            mode: modes[0],
            trajectory: trip.data.trajectory, 
        };
        const waypoint = build_waypoint(builder);

        if (waypoint) {

            const modifier = { 
                $set: {
                    'meta.updatedAt': new Date(),
                    'meta.state': 'completed',
                    'data.destination.date': arrival,
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

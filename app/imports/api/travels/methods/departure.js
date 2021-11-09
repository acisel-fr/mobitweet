import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Travels } from '/imports/api/travels/collections.js';
import { Option } from '/imports/schemas';
import { modes } from '/imports/variables';
import { build_waypoint } from '/imports/functions';

export const departure = new ValidatedMethod({
    name: 'travels::departure',

    validate: new SimpleSchema({
        departure: { type: String },
        constraint: { type: Option },
        arrival: { type: String, optional: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ departure, constraint, arrival }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 
            'meta.userId': userId, 
            'meta.state': { $nin: [ 'completed', 'cancelled' ] },
        };
        const trip = Travels.findOne(selector);
        const builder = {
            type: { code: 'departure', label: 'Départ' }, 
            date: departure, 
            mode: modes[0],
            trajectory: trip.data.trajectory,
        };
        const waypoint = build_waypoint(builder);

        if (waypoint) {

            const selector = {
                'meta.userId': userId,
                'meta.state': { $nin: [ 'completed', 'cancelled' ] },
            };
    
            const modifier = { 
                $set: {
                    'meta.updatedAt': new Date(),
                    'meta.state': 'walking',
                    'data.origin.date': departure,
                    'data.destination.flexibility.state': constraint,
                    'data.destination.flexibility.limit': arrival ? arrival : null,
                },
                $push: { 
                    'data.waypoints': waypoint, 
                } 
            };
    
            Travels.update(selector, modifier, (error) => {
                if (error) { console.error(error) }
            });
        }
    },
});

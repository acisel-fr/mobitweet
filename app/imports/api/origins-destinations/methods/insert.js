import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';
import _ from 'lodash';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';

import { insert as insert_trajectory } from '/imports/api/trajectories/methods';
import { Mode } from '/imports/schemas';

export const insert = new ValidatedMethod({
    name: 'origins-destinations::insert',

    validate: new SimpleSchema({
        origin: { type: Object, blackbox: true },
        destination: { type: Object, blackbox: true },
        trajectory: { type: Object, blackbox: true },
        mode: { type: Mode },
        label: { type: String },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ origin, destination, trajectory, mode, label }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const id = Random.id();
        const forth = id + '-forth';
        const back = id + '-back';

        const record = {
            meta: {
                createdAt: new Date(),
                userId: userId,
                id: forth,
                used: 0,
                version: 1,
            },
            data: {
                origin: origin,
                destination: destination,
            },
        };

        Origins_destinations.insert(record, (error) => {
            if (error) {
                console.error(error)
            } else {
                insert_trajectory.call({ odId: forth, trajectory: trajectory, mode: mode, label: label }, (error) => {
                    if (error) {
                        console.error(error)
                    } else {
                        record.meta.id = back;
                        record.data.origin = destination;
                        record.data.destination = origin;
                        trajectory.geometry.coordinates = _.reverse(trajectory.geometry.coordinates);
                        Origins_destinations.insert(record, (error) => {
                            if (error) {
                                console.error(error)
                            } else {
                                insert_trajectory.call({ odId: back, trajectory: trajectory, mode: mode, label: label }, (error) => {
                                    if (error) console.error(error)
                                });
                            }
                        });
                    }
                });
            }
        });

    },
});


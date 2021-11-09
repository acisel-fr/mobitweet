import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';

import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

export const start_survey = new ValidatedMethod({
    name: 'travels::start_survey',

    validate: new SimpleSchema({
        origin: { type: Object, blackbox: true },
        destination: { type: Object, blackbox: true },
        odId: { type: String },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ origin, destination, odId }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const date = new Date();
        const id = Random.id();
        const record = {
            meta: {
                createdAt: date,
                updatedAt: date,
                userId: userId,
                odId: odId,
                id: id,
                state: 'ready',
                version: 1,
            },
            data: {
                origin: origin,
                destination: destination,
                trajectory: null,
                waypoints: [],
            },
        };

        Travels.insert(record, (error) => {
            if (error) {
                console.error(error);
            } else {
                const pref = Preferences.findOne({ 'meta.userId': userId, 'meta.collection': 'filters'});
                if (!pref) {
                    const filters = {
                        meta: {
                            createdAt: new Date(),
                            userId: userId,
                            collection: 'filters',
                            id: Random.id(),
                            version: 1,
                        },
                        data: {
                            distance: 250,
                            orientation: 30,
                            timeline: {
                                unit: 'hours',
                                value: 2,
                            },
                            transport: true,
                        },
                    };
                    Preferences.insert(filters);
                }
            }
        });
        
        return id;

    },
});

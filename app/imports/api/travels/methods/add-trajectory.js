import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Travels } from '/imports/api/travels/collections.js';

export const add_trajectory = new ValidatedMethod({
    name: 'travels::add_trajectory',

    validate: new SimpleSchema({
        travelId: { type: String },
        trajectory: { type: Object, blackbox: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ travelId, trajectory }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId, 'meta.id': travelId };
        const modifier = { $set: { 'data.trajectory': trajectory }};

        Travels.update(selector, modifier, (error) => {
            if (error) console.error(error);
        });

    },
});


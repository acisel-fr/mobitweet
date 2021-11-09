import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';
import { Trajectories } from '/imports/api/trajectories/collections.js';

export const remove = new ValidatedMethod({
    name: 'origins-destinations::remove',

    validate: new SimpleSchema({
        id: { type: String },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ id }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId, 'meta.id': id };

        Origins_destinations.remove(selector, (error) => {
            if (error) {
                console.error(error);
            } else {
                const trajectories_selector = { 'meta.userId': userId, 'meta.odId': id };
                Trajectories.remove(trajectories_selector, (error) => {
                    if (error) console.error(error);
                });
            }
        });

    },
});


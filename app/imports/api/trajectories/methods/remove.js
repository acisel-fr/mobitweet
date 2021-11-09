import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Trajectories } from '/imports/api/trajectories/collections.js';

export const remove = new ValidatedMethod({
    name: 'trajectories::remove',

    validate: new SimpleSchema({
        id: { type: String },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ id }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        Trajectories.remove({ 'meta.userId': userId, 'meta.id': id }, (error) => {
            if (error) console.error(error);
        });

    },
});


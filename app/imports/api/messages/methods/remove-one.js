import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Messages } from '/imports/api/messages/collections.js';

export const remove_one = new ValidatedMethod({
    name: 'Messages::remove_one',

    validate: new SimpleSchema({
        id: { type: String },
    }).validator(),
        
    applyOptions: { noRetry: true },    

    run({ id }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        Messages.remove({ 'meta.userId': userId, 'meta.id': id });

    },
});

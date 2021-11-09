import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Messages } from '/imports/api/messages/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

export const deidentify = new ValidatedMethod({
    name: 'Messages::deidentify',

    validate: null,
        
    applyOptions: { noRetry: true },    

    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }
        
        const selector = { 'meta.userId': userId };
        const modifier = { $unset: { 'data.user': 1 }};
        const options = { multi: true };
        
        Messages.update(selector, modifier, options);
        Preferences.remove({ 'meta.userId': userId, 'meta.collection': 'sign' });

    },
});

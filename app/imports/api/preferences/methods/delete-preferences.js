import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Preferences } from '/imports/api/preferences/collections.js';

export const delete_preferences = new ValidatedMethod({
    name: 'preferences::delete_preferences',

    validate: new SimpleSchema({
        _id: { type: String, optional: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ _id }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId };
        if (_id) selector._id = _id;
        
        Preferences.remove(selector);
        
    },
});


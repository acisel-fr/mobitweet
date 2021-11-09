import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Preferences } from '/imports/api/preferences/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'preferences::remove_mine',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId };
        
        Preferences.remove(selector);
        
    },
});


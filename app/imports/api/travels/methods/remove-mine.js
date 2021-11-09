import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Travels } from '/imports/api/travels/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'travels::remove_mine',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId };
        
        Travels.remove(selector);

    },
});

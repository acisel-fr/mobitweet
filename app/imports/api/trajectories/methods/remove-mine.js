import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Trajectories } from '/imports/api/trajectories/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'trajectories::remove_mine',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId };
        
        Trajectories.remove(selector);

    },
});


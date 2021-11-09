import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Travels } from '/imports/api/travels/collections.js';

export const cancel = new ValidatedMethod({
    name: 'travels::cancel',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 
            'meta.userId': userId, 
            'meta.state': { $nin: [ 'completed', 'cancelled' ] },
        };
        const modifier = { 
            $set: {
                'meta.updatedAt': new Date(), 
                'meta.state': 'cancelled',
            }
        };
        
        Travels.update(selector, modifier);

    },
});

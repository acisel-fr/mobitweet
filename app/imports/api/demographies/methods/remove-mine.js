import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Demographies } from '/imports/api/demographies/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'Demographies::remove_mine',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        Demographies.remove({ 'meta.userId': userId });

    },
});

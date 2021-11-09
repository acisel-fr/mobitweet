import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Messages } from '/imports/api/messages/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'Messages::remove_mine',

    validate: null,
        
    applyOptions: { noRetry: true },    

    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        Messages.remove({ 'meta.userId': userId });

    },
});

import { Meteor } from 'meteor/meteor';

import { Messages } from '/imports/api/messages/collections.js';

Meteor.publish('messages::mine::all', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    return Messages.find({ 'meta.userId': userId });
    
});

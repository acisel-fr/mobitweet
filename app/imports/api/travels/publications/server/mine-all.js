import { Meteor } from 'meteor/meteor';

import { Travels } from '/imports/api/travels/collections.js';

Meteor.publish('travels::mine::all', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };

    return Travels.find(selector);
    
});

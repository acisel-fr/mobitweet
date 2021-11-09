import { Meteor } from 'meteor/meteor';

import { Travels } from '/imports/api/travels/collections.js';

Meteor.publish('travels::current', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId, 'meta.state': { $nin: [ 'completed', 'cancelled' ]} };
    const options = { limit: 1 };

    return Travels.find(selector, options);
    
});

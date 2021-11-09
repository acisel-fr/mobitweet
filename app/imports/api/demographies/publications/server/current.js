import { Meteor } from 'meteor/meteor';

import { Demographies } from '/imports/api/demographies/collections.js';

Meteor.publish('demographies::current', function () { 
    
    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };
    const options = { sort: { 'meta.createdAt': -1 }, limit: 1 };

    return Demographies.find(selector, options);
    
});

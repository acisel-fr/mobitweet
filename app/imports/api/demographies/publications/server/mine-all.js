import { Meteor } from 'meteor/meteor';

import { Demographies } from '/imports/api/demographies/collections.js';

Meteor.publish('demographies::mine::all', function () { 
    
    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };

    return Demographies.find(selector);
    
});

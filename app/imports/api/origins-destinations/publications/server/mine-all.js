import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';

Meteor.publish('origins-destinations::mine::all', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };

    return Origins_destinations.find(selector);

});

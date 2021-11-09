import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';

Meteor.publish('origins-destinations::mine::sorted', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };
    const options = { sort: { 'meta.used': -1 }};

    return Origins_destinations.find(selector);

});

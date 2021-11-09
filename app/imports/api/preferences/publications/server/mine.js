import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Preferences } from '/imports/api/preferences/collections.js';

Meteor.publish('preferences::mine', function (limit, collection) {

    const userId = this.userId;
    if (!userId) { return this.ready() }
    
    if (limit) check(limit, Number);
    if (collection) check(collection, String);

    const selector = { 'meta.userId': userId };
    const options = { sort: { 'meta.decay': -1 }};

    if (limit > 0) options.limit = limit;
    if (collection) selector['meta.collection'] = collection;
    
    return Preferences.find(selector, options);

});

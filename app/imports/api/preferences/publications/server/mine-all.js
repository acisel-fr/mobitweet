import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Preferences } from '/imports/api/preferences/collections.js';

Meteor.publish('preferences::mine::all', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }
    
    const selector = { 'meta.userId': userId };
    
    return Preferences.find(selector);

});

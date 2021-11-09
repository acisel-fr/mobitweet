import { Meteor } from 'meteor/meteor';

import { Trends } from '/imports/api/trends/collections.js';

Meteor.publish('trends', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    return Trends.find();

});

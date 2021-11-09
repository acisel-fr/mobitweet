import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Trajectories } from '/imports/api/trajectories/collections.js';

Meteor.publish('trajectories::one', function (id) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    check(id, String);

    const selector = { 'meta.userId': userId, 'meta.id': id };

    return Trajectories.find(selector);

});

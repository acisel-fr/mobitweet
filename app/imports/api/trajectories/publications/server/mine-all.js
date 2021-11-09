import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Trajectories } from '/imports/api/trajectories/collections.js';

Meteor.publish('trajectories::mine::all', function (id) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId };

    return Trajectories.find(selector);

});

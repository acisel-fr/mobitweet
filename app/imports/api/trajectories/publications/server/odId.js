import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Trajectories } from '/imports/api/trajectories/collections.js';

Meteor.publish('trajectories', function (odId) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { 'meta.userId': userId, 'meta.odId': odId };

    return Trajectories.find(selector);

});

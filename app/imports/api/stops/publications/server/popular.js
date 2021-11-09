import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import _ from 'lodash';

import { Stops } from '/imports/api/stops/collections.js';

Meteor.publish('Popular stops', function (limit) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    if (!limit) return this.ready();

    check(limit, Number);

    const pipeline = [
        { $sort: { 'meta.used': -1 }},
        { $match: { 'meta.used': { $gt: 5 }, 'meta.main': true }},
        { $limit: limit },
    ];

    const self = this;

    Stops.rawCollection().aggregate(
        pipeline, 
        Meteor.bindEnvironment(function(error, result) {
            if (error) {
                console.error(error);
            } else {
                _.forEach(result, (item) => {
                    self.added('popularSearch', Random.id(), item);
                });
                self.ready();
            }
        })
    );

});

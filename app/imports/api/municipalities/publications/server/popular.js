import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import _ from 'lodash';

import { Municipalities } from '/imports/api/municipalities/collections.js';

Meteor.publish('Popular municipalities', function (limit) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    if (!limit) return this.ready();

    check(limit, Number);

    const pipeline = [
        { $sort: { 'meta.used': -1 }},
        { $match: { 'meta.used': { $gt: 5 }}},
        { $limit: limit },
    ];

    const self = this;

    Municipalities.rawCollection().aggregate(
        pipeline, 
        Meteor.bindEnvironment(function(error, result) {
            if (error) {
                console.error(error);
            }
            _.forEach(result, (item) => {
                self.added('popularSearch', Random.id(), item);
            });
            self.ready();
        })
    );

});

import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import _ from 'lodash';

import { Stops } from '/imports/api/stops/collections.js';

Meteor.publish('Search a stop by name', function (pattern, limit) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    if (!pattern || !limit) return this.ready();

    check(pattern, String);
    check(limit, Number);

    pattern = pattern.trim().replace(/\s+/, '.*');

    const pipeline = [
        { $sort: { 'meta.used': -1 }},
        { $match: { 'meta.main': true }},
        { $match: { 'meta.text': { $regex: pattern, $options: 'ix' }}},
        { $limit: limit },
    ];

    const self = this;

    Stops.rawCollection().aggregate(
        pipeline, 
        Meteor.bindEnvironment(function(error, result) {
            if (error) {
                console.error(error)
            } else {
                _.forEach(result, (item) => {
                    self.added('textSearch', Random.id(), item);
                });
                self.ready();
            }
        })
    );

});

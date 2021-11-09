import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import _ from 'lodash';

import { Municipalities } from '/imports/api/municipalities/collections.js';

Meteor.publish('Search a municipality by name', function (pattern, limit) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    if (!pattern || !limit) return this.ready();

    check(pattern, String);
    check(limit, Number);

    pattern = pattern.trim().replace(/\s+/, '.*');

    const pipeline = [
        { $sort: { 'meta.used': -1 }},
        { $match: { 'meta.text': { $regex: pattern, $options: 'ix' }}},
        { $limit: limit },
    ];

    const self = this;

    Municipalities.rawCollection().aggregate(
        pipeline, 
        Meteor.bindEnvironment(function(error, result) {
            if (error) {
                console.error(error);
            } else {
                _.forEach(result, (item) => {
                    self.added('textSearch', Random.id(), item);
                });
                self.ready();
            }
        })
    );

});

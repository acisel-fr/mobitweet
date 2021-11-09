import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import { Municipalities } from '/imports/api/municipalities/collections.js';

import turf from '@turf/turf';

Meteor.publish('Search a municipality by location', function (geoJSON, limit) {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    if (!geoJSON || !limit) return this.ready();

    check(geoJSON, Object);
    check(limit, Number);

    const geoPoint = turf.centroid(geoJSON);
    const pipeline = [
        {
            $geoNear: {
               near: geoPoint.geometry,
               distanceField: "distance",
               limit: limit,
               spherical: true
            }
        },
    ];

    const self = this;
    Municipalities.rawCollection().aggregate(
        pipeline, 
        Meteor.bindEnvironment(function(error, result) {
            if (error) {
                console.error(error)
            } else {
                _.forEach(result, (item) => {
                    self.added('geoSearch', Random.id(), item);
                });
                self.ready();
            }
            
        })
    );

});

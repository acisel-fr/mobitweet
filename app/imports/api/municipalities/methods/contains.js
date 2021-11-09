import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Municipalities } from '/imports/api/municipalities/collections.js';

const GeoJSON = new SimpleSchema({
    type: { type: String },
    properties: { type: Object, optional: true, blackbox: true },
    geometry: { type: Object, blackbox: true },
});

export const contains = new ValidatedMethod({
    name: 'Municipalities::contains',

    validate: new SimpleSchema({
        geoJSON: { type: GeoJSON },
    }).validator(),
        
    run({ geoJSON }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        if (Meteor.isServer) {

            const userId = this.userId;
            if (!userId) { return }

            const geometry = geoJSON.geometry;
            const query = {
                'geoJSON.geometry': {
                    $geoIntersects: {
                        $geometry: geometry,
                    },
                },
            };

            return Municipalities.findOne(query);

        }
    },
});

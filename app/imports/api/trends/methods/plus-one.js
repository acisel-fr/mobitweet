import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Trends } from '/imports/api/trends/collections.js';
import { Municipalities } from '/imports/api/municipalities/collections.js';
import { Places } from '/imports/api/places/collections.js';
import { Stops } from '/imports/api/stops/collections.js';

export const plusOne = new ValidatedMethod({
    name: 'Trends::plusOne',

    validate: new SimpleSchema({
        collection: { type: String },
        id: { type: String },
    }).validator(),
        
    run({ id, collection }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const mongo = collection === 'municipalities' ? Municipalities :
                      collection === 'places' ? Places :
                      collection === 'stops' ? Stops :
                      undefined;

        if (mongo) {

            mongo.update({ 'meta.id': id }, { $inc: { 'meta.used': 1 }});
    
            const selector = { collection: collection };
            const exist = Trends.find(selector).count() > 0;
            
            if (exist) {
                const modifier = { 
                    $set: { updatedAt: new Date() },
                    $inc: { used: 1 },
                };
                Trends.update(selector, modifier);
            } else {
                const obj = {
                    createdAt: new Date(),
                    collection: collection,
                    used: 1,
                };
                Trends.insert(obj);
            }
            
        }
        
    },
});

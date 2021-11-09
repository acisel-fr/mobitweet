import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Preferences } from '/imports/api/preferences/collections.js';

import { plusOne } from '/imports/api/trends/methods';

const decay = 0.9;
const threshold = 0.5;

export const add_preference = new ValidatedMethod({
    name: 'preferences::add_preference',

    validate: new SimpleSchema({
        collection: { type: String },
        id: { type: String },
        data: { type: Object, blackbox: true, optional: true },
        geoJSON: { type: Object, blackbox: true, optional: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ collection, id, data, geoJSON }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        if (Meteor.isServer) {
            
            plusOne.call({ collection: collection, id: id });  

            const nbrPref = Preferences.update(
                { 'meta.userId': userId, 'meta.collection': collection },
                { $mul: { 'meta.decay': decay }, $set: { 'meta.updatedAt': new Date() }},
                { multi: true },
            );
            let found;
            if (nbrPref > 0) {
                found = Preferences.update(
                    { 'meta.userId': userId, 'meta.collection': collection, 'meta.id': id },
                    { $inc: { 'meta.used': 1, 'meta.decay': 1 }, $set: { 'meta.updatedAt': new Date() }},
                );
                Preferences.remove({ 'meta.userId': userId, 'meta.collection': collection, 'meta.decay': { $lt: threshold }});
            }
            if (!found) {
                const obj = {
                    meta: {
                        createdAt: new Date(),
                        userId: userId,
                        collection: collection,
                        id: id,
                        used: 1,
                        decay: 1,
                        hasGeo: geoJSON ? true : false,
                        version: 1,
                    },
                };
                if (data) obj.data = data;
                if (geoJSON) obj.geoJSON = geoJSON;
                Preferences.insert(obj);
            }
        }
    },
});


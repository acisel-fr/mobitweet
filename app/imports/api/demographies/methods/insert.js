import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';

import { Demographies } from '/imports/api/demographies/collections.js';
import { Option, GeoPolygon } from '/imports/schemas'

export const insert = new ValidatedMethod({
    name: 'Demographies::insert',

    validate: new SimpleSchema({
        birthYear: { type: Number },
        gender: { type: Option },
        profession: { type: Option },
        residence: { type: GeoPolygon },
        nbrOfPersons: { type: Number },
        nbrOfChildren: { type: Number, optional: true },
        nbrOfVehicles: { type: Number },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ birthYear, gender, profession, residence, nbrOfPersons, nbrOfChildren, nbrOfVehicles }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        let record = {
            meta: {
                createdAt: new Date(),
                userId: userId, 
                id: Random.id(),   
                version: 1,
            },
            data: {
                birthYear: birthYear,
                gender: gender,
                profession: profession,
                residence: residence.properties.label,
                nbrOfPersons: nbrOfPersons,
                nbrOfChildren: nbrOfChildren,
                nbrOfVehicles: nbrOfVehicles,
            },
            geoJSON: residence,
        };

        const id = Demographies.insert(record, (error) => {
            if (error) console.error(error);
        });

        return id;

    },
});

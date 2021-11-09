import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';
import _ from 'lodash';

import { Trajectories } from '/imports/api/trajectories/collections.js';
import { Mode } from '/imports/schemas';

export const insert = new ValidatedMethod({
    name: 'trajectories::insert',

    validate: new SimpleSchema({
        odId: { type: String },
        label: { type: String },
        mode: { type: Mode },
        trajectory: { type: Object, blackbox: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ odId, label, mode, trajectory }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const id = Random.id();
        const record = {
            meta: {
                createdAt: new Date(),
                userId: userId,
                odId: odId,
                id: id,
                version: 1,
            },
            data: {
                label: label,
                mode: mode,
            },
            geoJSON: trajectory,
        };

        Trajectories.insert(record);

    },
});

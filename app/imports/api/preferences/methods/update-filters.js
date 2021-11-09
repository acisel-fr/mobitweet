import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Preferences } from '/imports/api/preferences/collections.js';

export const update_filters = new ValidatedMethod({
    name: 'preferences::update_filters',

    validate: new SimpleSchema({
        distance: { type: Number },
        orientation: { type: Number },
        transport: { type: Boolean },
        timeline: { type: Object, blackbox: true },
    }).validator(),
    
    applyOptions: { noRetry: true },    
    
    run({ distance, orientation, transport, timeline }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId, 'meta.collection': 'filters' };
        const modifier = {
            $set: {
                'data.distance': distance,
                'data.orientation': orientation,
                'data.transport': transport,
                'data.timeline': timeline,
            },
        };
        
        Preferences.update(selector, modifier);

    },
});


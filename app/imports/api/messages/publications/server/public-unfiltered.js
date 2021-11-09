import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

import { Messages } from '/imports/api/messages/collections.js';

Meteor.publish('messages::public::unfiltered', function (limit) {
    
    check(limit, Number);

    const self = this;

    const selector = {};
    const options = { 
        sort: { 'data.date': -1 },
        limit: limit, 
    };

    let records = Messages.find(selector, options)
        .map(
            item => {
                const record = {
                    id: item.meta.id,
                    location: item.geoJSON,
                    bearing: item.data.bearing,
                    orientation: item.data.orientation,
                    date: item.data.date,
                    message: item.data.message,
                    theme: item.data.theme,
                    mode: item.data.mode ? item.data.mode.code : '',
                    user: item.data.user,
                    userId: item.meta.userId,
                };
                self.added('messages', Random.id(), record);
            }
        );

    self.ready();    

});

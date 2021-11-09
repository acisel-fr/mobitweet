import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Messages } from '/imports/api/messages/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

export const identify = new ValidatedMethod({
    name: 'Messages::identify',

    validate: null,
        
    applyOptions: { noRetry: true },    

    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }
        
        const user = {
            name: Meteor.user().profile.name,
            login: Meteor.user().services.twitter.screenName,
            image: Meteor.user().services.twitter.profile_image_url_https,
        }
        
        const selector = { 'meta.userId': userId };
        const modifier = { $set: { 'data.user': user }};
        const options = { multi: true };
        
        Messages.update(selector, modifier, options);
        Preferences.upsert({ 'meta.userId': userId, 'meta.collection': 'sign' }, { $set: { 'data.sign': true } });

    },
});

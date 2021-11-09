import { Meteor } from 'meteor/meteor';

Meteor.publish('user_profile', function () {

    const userId = this.userId;
    if (!userId) { return this.ready() }

    const selector = { _id: userId };
    
    const project = { 
        fields: { 
            '_id': 1,
            'emails': 1,
            'profile.name': 1, 
            'services.twitter.id': 1,
            'services.twitter.screenName': 1,
            'services.twitter.profile_image_url_https': 1, 
            'services.twitter.lang': 1,
            'services.resume.loginTokens.when': 1,
        }
    };

    return Meteor.users.find(selector, project);

});

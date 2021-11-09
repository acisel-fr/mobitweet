import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

export const suppress_my_account = new ValidatedMethod({
    name: 'users::suppress_my_account',

    validate: null,

    applyOptions: { noRetry: true },    
    
    run() {
        
        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }
        
        FlowRouter.go('map');

        if (Meteor.isServer) {

            const last_login = _.last(Meteor.user().services.resume.loginTokens);

            const modifier = {
                $set: {
                    lastLoggedAt: last_login.when,
                },
                $unset: { 
                    profile: 1,
                    emails: 1, 
                    services: 1, 
                    roles: 1,
                    hasLoggedIn: 1,
                },
            };

            Meteor.users.update(userId, modifier);
            
        }
        
    },
});

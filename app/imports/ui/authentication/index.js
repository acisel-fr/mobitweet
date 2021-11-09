import '/imports/ui/button-close';
import './authentication.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from '/public/moment-with-locales.min.js';
import _ from 'lodash';

T9n.setLanguage('fr');

import { suppress_my_account } from '/imports/api/users/methods';

Template.authentication.onCreated(function () {
    this.subscribe('user_profile');
});

Template.authentication.helpers({
    twitter() {
        const user = Meteor.user();
        return user && user.services && user.services.twitter;
    },
    courriel() {
        const user = Meteor.user();
        return user && _.first(user.emails);
    },
    compte() {
        const user = Meteor.user();
        if (user && user.services) return user.profile.name;
    },
    image() {
        const user = Meteor.user();
        if (user && user.services) {
            const image = user.services.twitter.profile_image_url_https;
            return image.replace(/normal/, '400x400');
        }
    },
    when() {
        const user = Meteor.user();
        if (user && user.services) {
            const date = _.last(user.services.resume.loginTokens).when;
            moment.locale('fr');
            return moment(date).fromNow();        
        }
    },
});

Template.authentication.events({
    "click #js-login"() {
        Meteor.loginWithTwitter();
    },
    "click #js-close"() {
        const route = Session.get('come-back') || 'home';
        Session.set('come-back', null);
        FlowRouter.go(route);
    },
    "click #js-logout"() { 
        Meteor.logout();
        FlowRouter.go('map');
    },
    "click #suppressAccount"() { 
        suppress_my_account.call() 
    },
});
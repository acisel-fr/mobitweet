import './list.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from '/public/moment-with-locales.min.js';
import { sprintf } from 'sprintf-js';
import turf from '@turf/turf';
import _ from 'lodash';

import { Messages } from '/imports/api/messages/collections.js';

import { remove_one as remove } from '/imports/api/messages/methods'

Template.list.onRendered(function () {
    $(document).ready(function () {
        $(window).scrollTop(0);
    }); 
});

Template.list.helpers({
    messages() {
        const limit = Session.get('messages_limit') - 1;
        const selector = {};
        const options = { sort: { ordonnee: -1 }, limit: limit };
        return Messages.find(selector, options); 
        },
    more() { 
        const limit = Session.get('messages_limit');
        const selector = {};
        const options = { sort: { ordonnee: -1 }, limit: limit };
        const count = Messages.find(selector, options).count(); 
        return count && count === limit;
    },
    lines() {
        const message = this.message.replace(/\n?#[^#]+$/, '');
        return message.split(/\n/);
    },
    ordonnee() { return this.ordonnee ? sprintf("%.1f km", Math.abs(this.ordonnee/1000)) : this.ordonnee === 0 ? 'Ici' : null },
    devant() { return this.ordonnee < 0 ? 'derrière' : this.ordonnee > 0 ? 'devant' : null }, 
    date() {
        moment.locale('fr');
        return moment(this.date).fromNow();  
    },
    owner() { 
        const userId = Meteor.userId();
        return userId === this.userId;
    },
    delete_wanted() { return Session.get('delete_wanted') === this.id },
});

Template.list.events({
    "click #js-message"() {
        FlowRouter.go('map');
        const center = _.reverse(turf.getCoord(this.location))
        Session.set('zoom-in', { center: center, zoom: 16, _id: this._id });
    },
    "click #js-limit"() { Session.set('messages_limit', Session.get('messages_limit') + __LIMIT_MESSAGE) },
    'click #js-want-delete'() {
        Session.set('delete_wanted', this.id);
    },
    'click #js-close-delete'() {
        Session.set('delete_wanted', null);
    },
    'click #js-delete'() {
        remove.call({ id: this.id });
        Session.set('delete_wanted', null);
    },
    'click #js-participate'() {
        if (Meteor.userId()) {
            FlowRouter.go('participate');
        } else {
            FlowRouter.go('surveys', { code: 'consents' }, { field: '0' });
        }
    },
});

export function get_message() {
    const limit = Session.get('messages_limit');
    const selector = {};
    const options = { sort: { ordonnee: -1 }, limit: limit };
    return Messages.find(selector, options); 
}
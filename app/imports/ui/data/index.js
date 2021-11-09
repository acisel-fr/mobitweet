import './data.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { subscriptions } from '/imports/variables';

Template.data.onCreated(function () {
    const self = this;
    self.subs = _.filter(subscriptions, item => item.title);
    _.forEach(self.subs, item => self.subscribe(item.collection + '::mine::all')); 
});

Template.data.helpers({
    collections() { return Template.instance().subs },
});

Template.data_card.helpers({
    path() { return FlowRouter.path('collections', { code: this.collection }) },
    stored() {
        const mongo = this.mongo();
        return mongo.find().count() + ' enregistrements.';
    },
    want_delete() { return Session.get('want_delete') === this.collection },
});

Template.data.events({
    "click #js-want-delete"() {
        Session.set('want_delete', this.collection);
    },
    "click #js-cancel-delete"() {
        Session.set('want_delete', null);
    },
    "click #js-delete"() {
        Session.set('want_delete', null);
        this.suppress();
    },
});
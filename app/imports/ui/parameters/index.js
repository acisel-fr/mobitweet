import '/imports/ui/button-close';
import './parameters.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';
import { update_filters } from '/imports/api/preferences/methods';
import { identify, deidentify } from '/imports/api/messages/methods';

Template.parameters.onCreated(function () {
    const self = this;
    self.subscribe('user_profile');
    self.subscribe('preferences::mine', 0, 'filters');
    self.subscribe('travels::current');
    self.items = [
        {
            code: 'about',
            icon: 'home',
            label: 'À propos de Mobitweet',
            show: true,
        },
    ];
    self.filters = [
        {
            code: 'distance',
            label: 'Distance',
            show: () => Travels.findOne(),
            options: [
                { label: '±50m', value: 50, show: true },
                { label: '100', value: 100, show: true },
                { label: '250', value: 250, show: true },
                { label: '500', value: 500, show: true },
                { label: 'Off', value: -1, show: () => Roles.userIsInRole(Meteor.userId(), ['alpha'], Roles.GLOBAL_GROUP) },
            ],
        },
        {
            code: 'orientation',
            label: 'Orientation',
            show: () => Travels.findOne(),
            options: [
                { label: '±5°', value: 5, show: true },
                { label: '30', value: 30, show: true },
                { label: 'Off', value: -1, show: () => Roles.userIsInRole(Meteor.userId(), ['alpha'], Roles.GLOBAL_GROUP) },
            ],
        },
        {
            code: 'transport',
            label: 'Transport',
            show: () => Travels.findOne(),
            options: [
                { label: 'On', value: true, show: true },
                { label: 'Off', value: false, show: true },
            ],
        },
        {
            code: 'timeline',
            label: 'Historique',
            show: true,
            options: [
                { label: '2h', value: { unit: 'hours', value: 2 }, show: true },
                { label: '24', value: { unit: 'hours', value: 24 }, show: true },
                { label: '48', value: { unit: 'hours', value: 48 }, show: true },
                { label: '7j', value: { unit: 'days', value: 7 }, show: true },
                { label: 'Off', value: { unit: 'days', value: -1 }, show: () => Roles.userIsInRole(Meteor.userId(), ['alpha'], Roles.GLOBAL_GROUP) },
            ],
        },
    ];
});

Template.parameters.onRendered(function () {
    $(document).ready(function () {
        $(window).scrollTop(0);
    }); 
});

Template.parameters.helpers({
    filters() { return Template.instance().filters },
    items() { return Template.instance().items },
    twitter() {
        const user = Meteor.user();
        return user && user.services && user.services.twitter;
    },
    path() { 
        const path = FlowRouter.path(this.code);
        return path;
    },
});

Template.parameters.events({
    "click #js-associate"() {
        identify.call();
        FlowRouter.go('list');
    },
    "click #js-dissociate"() { 
        deidentify.call();
        FlowRouter.go('list');
    },
});

Template.parameters_button.helpers({
    active() {
        const value = this.value;
        const code = Template.parentData().code;
        const pref = Preferences.findOne();
        if (pref) {
            if (typeof pref.data[code] === 'object') {
                return pref.data[code].unit === value.unit && pref.data[code].value === value.value ? 'active' : '';
            } else {
                return pref.data[code] === value ? 'active' : '';
            }
        }
    },
});
Template.parameters_button.events({
    "click"() {
        const value = this.value;
        const code = Template.parentData().code;
        const pref = Preferences.findOne();
        if (pref) {
            if (typeof pref.data[code] === 'object') {
                pref.data[code].unit = value.unit;
                pref.data[code].value = value.value;
            } else {
                pref.data[code] = value;
            }
            update_filters.call(pref.data);
        }
    },
});
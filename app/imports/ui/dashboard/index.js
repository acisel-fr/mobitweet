import './dashboard.html';

import { Template } from 'meteor/templating';

import { Travels } from '/imports/api/travels/collections.js';

Template.dashboard.onCreated(function () {
    const self = this;
    self.subscribe('travels::current');
});

Template.dashboard.helpers({
    is_recording() { return Travels.findOne() },
});

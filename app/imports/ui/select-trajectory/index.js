import '/imports/ui/button-close';
import './select-trajectory.html';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { sprintf } from 'sprintf-js';

import { Trajectories } from '/imports/api/trajectories/collections.js';

import { modes } from '/imports/variables';
import { remove } from '/imports/api/trajectories/methods';

Template.select_trajectory.onCreated(function () {
    const self = this;
    Session.set('delete_wanted', null);
    self.autorun(() => {
        const survey = Session.get('survey');
        if (survey) {
            const odId = survey.odId;
            self.subscribe('trajectories', odId);
        }
    });
});

Template.select_trajectory.helpers({
    trajectories() {
        return Trajectories.find() 
    },
});

Template.select_trajectory_item.helpers({
    active() {
        const delete_wanted = Session.get('delete_wanted');
        if (delete_wanted) return;
        const selected = Session.get('selected');
        return selected && selected.meta.id === this.meta.id ? 'active' : '';

    },
    delete_wanted() { return Session.get('delete_wanted') === this.meta.id },
    distance() { return sprintf("%.2f km", this.geoJSON.properties.distance/1000)},
});

Template.select_trajectory_item.events({
    'click #js-want-delete'(event, template) {
        Session.set('delete_wanted', this.meta.id);
        Session.set('selected', null);
    },
    'click #js-close-delete'(event, template) {
        Session.set('delete_wanted', null);
    },
    'click #js-delete'() {
        remove.call({ id: this.meta.id });
        Session.set('delete_wanted', null);
    },
    'click #js-start'() {
        Session.set('delete_wanted', null);
        const selected = Session.get('selected');
        if (selected && selected.meta && selected.meta.id === this.meta.id) {
            Session.set('selected', null);
        } else {
            Session.set('selected', this);
        }
    },
});

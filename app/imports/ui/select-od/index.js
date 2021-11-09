import '/imports/ui/button-close';
import './select-od.html';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { sprintf } from 'sprintf-js';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';

import { remove } from '/imports/api/origins-destinations/methods';

Template.select_od.onCreated(function () {
    this.subscribe('origins-destinations::mine::sorted');
    Session.set('delete_wanted', null);
});

Template.select_od.helpers({
    origins_destinations() { return Origins_destinations.find() },
});

Template.select_od_item.helpers({
    active() {
        const delete_wanted = Session.get('delete_wanted');
        if (delete_wanted) return;
        const selected = Session.get('selected');
        return selected && selected.odId === this.meta.id ? 'active' : '';
    },
    delete_wanted() { return Session.get('delete_wanted') === this.meta.id },
});

Template.select_od_item.events({
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
        if (selected && selected.odId === this.meta.id) {
            Session.set('selected', null);
        } else {
            Session.set('selected', { origin: this.data.origin, destination: this.data.destination, odId: this.meta.id });
        }
    },
});

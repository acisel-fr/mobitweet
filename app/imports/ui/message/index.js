import './message.html';

import { Template } from 'meteor/templating';
import moment from '/public/moment-with-locales.min.js';
import _ from 'lodash';

import { Travels } from '/imports/api/travels/collections.js';

Template.message.onCreated(function () {
    const self = this;
    self.subscribe('travels::current');
});

Template.message.onRendered(function () {
    const self = this;

    $(document).ready(function () {
        $(window).scrollTop(0);
    });

    Session.set('text', null);
    const append = self.data.type.append();
    Session.set('selected', append);

    self.autorun(() => {
        const text = Session.get('text');
        const message = text ? text + ' ' + append : append;
        Session.set('selected', message);
    });
});

Template.message.helpers({
    color() {
        const selected = Session.get('selected');
        const length = byteCount(selected);
        return length > 280 ? 'text-danger': length > 265 ? 'text-warning' : 'text-muted' 
    },
    nbr() {
        const selected = Session.get('selected');
        const length = byteCount(selected);
        return length;
    },
    help_buttons() {
        const travel = Travels.findOne();
        if (travel) {
            const labels = [];
            labels.push(moment(travel.data.origin.date).local().format('HH:mm'));
            labels.push(travel.data.origin.location.properties.label);
            const waypoints = _.filter(travel.data.waypoints, o => o.type.code != 'location');
            _.forEach(waypoints, function(o) {
                labels.push(moment(o.date).local().format('HH:mm'));
                if (o.location && o.location.properties && o.location.properties.label) labels.push(o.location.properties.label);
                labels.push(o.mode.label);
                if (o.mode.terminus) labels.push(o.mode.terminus.properties.label)
            });
            labels.push(travel.data.destination.location.properties.label);
            const uniq = _.uniq(labels);
            return uniq;
        }
    },
});

Template.message.events({
    "input #survey, change #survey"(event, template) {
        const input = $('#survey').val();
        Session.set('error', undefined);
        toastr.clear();
        Session.set('text', input);
    },
});

Template.message_help_button.events({
    "click"(event, template) {
        const text = $('#survey').val();
        const input = text ? text + ' ' + this : '' + this;
        $('#survey').val(input);
        Session.set('text', input);
    },
});

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

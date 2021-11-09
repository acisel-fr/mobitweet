import '/imports/ui/about';
import '/imports/ui/consents';
import '/imports/ui/datetime';
import '/imports/ui/draw-path';
import '/imports/ui/explanations';
import '/imports/ui/geosearch';
import '/imports/ui/number';
import '/imports/ui/position';
import '/imports/ui/select';
import '/imports/ui/text';
import '/imports/ui/message';
import '/imports/ui/select-od';
import './surveys.html';

import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

import { surveys } from '/imports/surveys';

import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

Template.surveys.onCreated(function() {
    const self = this;
    self.subscribe('user_profile');
    self.subscribe('travels::current');
    self.subscribe('preferences::mine', 0, 'filters');
});

Template.surveys.helpers({
    task() {
        FlowRouter.watchPathChange();
        const code = FlowRouter.getParam('code');
        const field = FlowRouter.getQueryParam('field');
        const survey = _.find(surveys, { code: code });
        const task = survey.tasks[field];
        return task;
    },
});

Template.surveys_button.helpers({
    color() { return this.color ? this.color : this.code === 'next' ? 'primary' : 'light' },
    icon() { return this.icon ? this.icon : this.code === 'previous' ? 'chevron-left' : 'chevron-right' },
    is_previous() { return this.code === 'previous' },
    label() {
        if (this.label) {
            return typeof this.label === 'function' ? this.label() : this.label;
        } else {
            return this.code === 'previous' ? 'Précédent' : 'Suivant';
        }
    },
    show() { return this.hide ? false : true },
    disabled() { return disabled(this) },
});

Template.surveys_button.events({
    "click"() {
        const self = this;
        Session.set('error', null);
        if (self.code === 'previous') {
            if (self.action) {
                self.action();
                clear();
            } else {
                clear();
                $(window).scrollTop(0);
                const index = Number(FlowRouter.getQueryParam('field'));
                FlowRouter.setQueryParams({ field: index - 1 });
            }
        } else if (self.code === 'next') {
            if (disabled(self)) return;
            const measure = Travels.findOne();
            const msg = self.errors ? self.errors(measure) : undefined;
            if (msg) {
                const error = {
                    msg: msg,
                    type: 'warning',
                    date: new Date(),
                };
                Session.set('error', error);
            } else {
                if (self.action) {
                    self.action(measure) 
                    clear();
                } else {
                    clear();
                    $(window).scrollTop(0);
                    const index = Number(FlowRouter.getQueryParam('field'));
                    FlowRouter.setQueryParams({ field: index + 1 });
                }
            }
        }
    },
});

function clear() {
    Session.set('selected', null);
    Session.set('choose', null);    
}

function disabled(self) {
    if (!self) return;
    if (self.code === 'previous') return;
    if (self.disabled) return self.disabled() ? 'disabled' : undefined;
    return Session.get('selected') === 0 || Session.get('selected') ? undefined : 'disabled';
}
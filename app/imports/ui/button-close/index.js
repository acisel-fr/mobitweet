import './button-close.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.button_close.events({
    "click #js-close"() {
        const route = Session.get('come-back') || 'map';
        Session.set('come-back', null);
        FlowRouter.go(route);
    },
});
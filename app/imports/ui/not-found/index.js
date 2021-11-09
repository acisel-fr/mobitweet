import './not-found.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.not_found.onRendered(function () {
    Session.set('error', null);
    const error = {
        msg: "Nous sommes désolés, mais la page que vous demandez est actuellement indisponible.",
        type: 'warning',
        date: new Date(),
    };
    Session.set('error', error);
    FlowRouter.go('home');
});
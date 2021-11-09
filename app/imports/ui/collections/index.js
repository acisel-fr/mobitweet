import '/imports/ui/button-close';
import './collections.html';

import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';

import { subscriptions } from '/imports/variables';

Template.collections.onCreated(function() {
    const self = this;
    self.autorun(() => {
        self.collection = FlowRouter.getParam('code');
        self.type = FlowRouter.getQueryParam('type');
        const offset = Number(FlowRouter.getQueryParam('offset'));
        self.offset = offset && offset >= 0 ? offset : 0;
        self.subscription = _.find(
            subscriptions, 
            item => (item.condition && item.condition(self)) || (!item.condition && item.collection === self.collection),
        );
        if (self.subscription && self.subscription.subscribe) {
            self.subscription.subscribe(self);
        } else {
            self.subscribe(self.subscription.collection + '::mine::all');
        }
    });
});

Template.collections.helpers({
    json() {
        const self = Template.instance().subscription;
        if (self) {
            const data = self.data ? self.data() : self.mongo().find().fetch();
            return JSON.stringify(data, null, 2);
        }
    },
});

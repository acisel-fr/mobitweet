import '/imports/ui/geosearch-item';
import './geosearch-items.html';

Template.geosearchItems.helpers({
    isExpanded() { return this.items && this.items.count() > __LIMIT },
    hasMoreItems() { return this.items && this.items.count() >= Session.get('limit') },
});

Template.geosearchItems.events({
    "click #less"(event, template) {
        Session.set('limit', __LIMIT);
        $(window).scrollTop(0);
    },
    "click #more"(event, template) {
        Session.set('limit', Session.get('limit') + __LIMIT_INC);
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    },
});

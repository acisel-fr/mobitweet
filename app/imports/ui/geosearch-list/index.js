import '/imports/ui/geosearch-items';
import './geosearch-list.html';

Template.geosearchList.helpers({
    expanded() { return this.items && this.items.count() > __LIMIT },
    hasItems() { return this.items && this.items.count() > 0 },
    hasMoreItems() { return this.items && this.items.count() >= Session.get('limit') },
});

Template.geosearchList.events({
    "click #expandMore"() {
        Session.set('limit', Session.get('limit') + __LIMIT_INC);
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    },
    "click #expandLess"() { Session.set('limit', __LIMIT) },
});


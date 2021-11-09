import './select.html';

Template.select_option.onRendered(function () {
    $(document).ready(function () {
        $(window).scrollTop(0);
    });
});

Template.select_option.helpers({
    selected() {
        const selected = Session.get('selected');
        return selected && selected.code === this.code ? 'list-group-item-primary' : '';
    },
});

Template.select_option.events({
    "click"() {
        const option = this;
        const selected = Session.get('selected');
        if (selected && selected.code === this.code) {
            Session.set('selected', undefined);
        } else {
            Session.set('selected', option);
        }
    },
});
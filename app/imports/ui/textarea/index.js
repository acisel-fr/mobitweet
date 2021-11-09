import './textarea.html';

Template.textarea.helpers({
    nbr() {
        const input = Session.get('selected');
        return input ? input.length : 0;
    },
});

Template.textarea.events({
    "input #survey"() {
        const input = $('#survey').val();
        Session.set('error', undefined);
        toastr.clear();
        Session.set('selected', input);
    },
});
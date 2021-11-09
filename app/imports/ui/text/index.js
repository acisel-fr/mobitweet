import './text.html';

Template.text.onRendered(function () {
    $(document).ready(function () { $('#survey').focus() });
});

Template.text.events({
    "focus #survey"() {
        Session.set('error', undefined);
        toastr.clear();
    },
    "input #survey"() {
        const input = $('#survey').val();
        Session.set('error', undefined);
        toastr.clear();
        Session.set('selected', input);
    },
});
import './number.html';

Template.number.events({
    "focus #survey"() {
        $('#survey').val('');
        Session.set('selected', undefined);
        Session.set('error', undefined);
        toastr.clear();
    },
    "input #survey"() {
        const input = Number($('#survey').val());
        Session.set('error', undefined);
        toastr.clear();
        Session.set('selected', input);
    },
});
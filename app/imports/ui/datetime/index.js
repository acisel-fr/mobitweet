import './datetime.html';

import moment from '/public/moment-with-locales.min.js';

Template.datetime.events({
    "click #today"() {
        const today = moment().format('YYYY-MM-DD');
        $('#date').val(today);
        getDateTime();
    },
    "click #now"() {
        const timestamp = moment();
        const now = timestamp.format();
        const date = timestamp.format('YYYY-MM-DD');
        $('#date').val(date);
        const time = timestamp.format('HH:mm');
        $('#survey').val(time);
        Session.set('selected', now);
        Session.set('error', undefined);
        toastr.clear();
    },
    "focus #survey"() {
        Session.set('selected', undefined);
        Session.set('error', undefined);
        toastr.clear();
    },
    "input #survey, input #date"() {
        getDateTime();
    },
});

function getDateTime() {
    const date = $('#date').val();
    const time = $('#survey').val();
    if (date && time) {
        const datetime = moment(`${date} ${time}`).format();
        Session.set('selected', datetime);
        Session.set('error', undefined);
        toastr.clear();
    }
}

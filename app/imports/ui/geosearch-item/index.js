import './geosearch-item.html';

Template.geosearchItem.helpers({
    selected() {
        const selected = Session.get('selected');
        const choose = Session.get('choose');
        const selected_active = selected && selected.geoJSON.properties.id === this.geoJSON.properties.id;
        const choose_active = choose && choose.geoJSON.properties.id === this.geoJSON.properties.id;
        return  choose_active ? 'list-group-item-primary' :
                selected_active ? 'list-group-item-secondary' : '';
    },
    km() {
        const distance = this.distance;
        if (distance >= 0) {
            const d = distance < 1000  ? '' + Math.round(distance) + ' m' :
                      distance < 10000 ? '' + Math.round(distance/10)/100 + ' km' :
                                         '' + Math.round(distance/100)/10 + ' km' ;
            return d;
        }
    },
});

Template.geosearchItem.events({
    "click"(event, template) {
        Session.set('selected', this);
    },
});

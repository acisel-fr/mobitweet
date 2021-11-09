import turf from '@turf/turf';
import { get_orientation_from_bearing } from '/imports/functions';

export function point_on_line(trajectory, point) {

    try {

        const threshold = 0.1; // kilomètres
        const point_on_line = turf.nearestPointOnLine(trajectory, point, { units: 'kilometers' });
        const along = point_on_line.properties.location;
        const along2 =  along > threshold ? along - threshold : along + threshold;
        const point2 = turf.along(trajectory, along2, { units: 'kilometers' });
        const bearing = along > threshold ? turf.bearing(point2, point_on_line) : turf.bearing(point_on_line, point2);
        const orientation = get_orientation_from_bearing(bearing);
        delete(point_on_line.properties.dist);
        delete(point_on_line.properties.location);
        delete(point_on_line.properties.index);
        point_on_line.properties.distance = along * 1000;
        point_on_line.properties.bearing = bearing;
        point_on_line.properties.orientation = orientation;
        return point_on_line;

    } catch(error) {
        console.error(error);
        /*if (Meteor.isClient) {
            const error = {
                msg: "Impossible de trouver votre position sur le parcours que vous avez défini.",
                type: 'danger',
            };
            Session.set('error', error);
        }*/
    }
}

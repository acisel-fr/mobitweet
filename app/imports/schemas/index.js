import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Option = new SimpleSchema({
    code: { type: String },
    label: { type: String },
});

export const GPS = new SimpleSchema({
    type: { type: String },
    coordinates: { type: [Number], minCount: 2, maxCount: 2, decimal: true },
});

export const GeoPoint = new SimpleSchema({
    type: { type: String },
    properties: { type: Object, optional: true, blackbox: true },
    geometry: { type: GPS },
});

export const GeoPolygon = new SimpleSchema({
    type: { type: String },
    properties: { type: Object, optional: true, blackbox: true },
    geometry: { type: Object, blackbox: true },
});

export const Mode = new SimpleSchema({
    code: { type: String },
    label: { type: String },
    isPT: { type: Boolean, optional: true },
    icon: { type: String },
    terminus: { type: GeoPoint, optional: true },
    max_speed: { type: Number }, 
});

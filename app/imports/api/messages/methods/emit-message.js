import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';

import moment from '/public/moment-with-locales.min.js';
import _ from 'lodash';

import { Messages } from '/imports/api/messages/collections.js';
import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

import { Option, GeoPoint } from '/imports/schemas';
import { build_waypoint } from '/imports/functions';

export const emit_message = new ValidatedMethod({
    name: 'Messages::emit_message',

    validate: new SimpleSchema({
        theme: { type: Option },
        location: { type: GeoPoint },
        message: { type: String },
    }).validator(),
        
    applyOptions: { noRetry: false },    

    run({ theme, location, message }) {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }
        const user = Meteor.users.findOne(userId);

        const id = Random.id();
        const date = moment().format();       
        const selector = { 
            'meta.userId': userId, 
            'meta.state': { $nin: [ 'completed', 'cancelled' ] },
        };
        const trip = Travels.findOne(selector);
        const last = _.last(trip.data.waypoints); 
        const mode = last.mode;

        const builder = {
            last: last, 
            type: { code: 'message', label: 'Message' }, 
            date: date, 
            point: location, 
            mode: mode, 
            trajectory: trip.data.trajectory,
        };

        const waypoint = build_waypoint(builder);

        if (!waypoint) return;

        const item = {
            meta: {
                createdAt: new Date(),
                userId: userId,  
                travelId: trip.meta.id, 
                id: id, 
                version: 1, 
            },
            data: {
                date: date,
                message: message,
                theme: theme,
                bearing: location.properties.bearing,
                orientation: location.properties.orientation,
                mode: mode,
                user: null,
                tweet: null,
            },
            geoJSON: location,
        };

        const pref = Preferences.findOne({ 'meta.userId': userId, 'meta.collection': 'sign' });
        if (pref && pref.data.sign) item.data.user = {
            name: user.profile.name,
            login: user.services.twitter.screenName,
            image: user.services.twitter.profile_image_url_https,
        }
        
        waypoint.messageId = id;

        const modifier = { 
            $set: { 
                'meta.updatedAt': new Date(), 
            },
            $push: {
                'data.waypoints': waypoint,
            },
        };                        

        if (user.services && user.services.twitter) {
            if (Meteor.isServer) {
                import Twit from 'twit';
                const settings = _.find(Meteor.settings.API, { id: 'Twitter' });
                const participant = new Twit({
                    consumer_key:         settings.consumer_key,
                    consumer_secret:      settings.consumer_secret,
                    access_token:         user.services.twitter.accessToken,
                    access_token_secret:  user.services.twitter.accessTokenSecret,
                    timeout_ms:           60*1000,
                });
                const mobitweet = new Twit({
                    consumer_key:         settings.consumer_key,
                    consumer_secret:      settings.consumer_secret,
                    access_token:         settings.accessToken,
                    access_token_secret:  settings.accessTokenSecret,
                    timeout_ms:           60*1000,
                });
                participant.post('statuses/update', { status: message }, Meteor.bindEnvironment(function(error, data, response) {
                    if (error) {
                        console.error(error);
                    } else {
                        item.data.tweet = data;
                        Messages.insert(item, (error, result) => {
                            if (error) {
                                console.error(error);
                            } else {
                                Travels.update(selector, modifier, (error, result) => {
                                    if (error) console.error(error);
                                });            
                            }
                        });
                        mobitweet.post('statuses/retweet', { id: data.id_str }, Meteor.bindEnvironment(function(error) {
                            if (error) console.error(error);
                        }));
                    }
                }));
            }
        } else {
            item.data.message.replace(/#[^#]+$/, '');
            Messages.insert(item, (error, result) => {
                if (error) {
                    console.error(error);
                } else {
                    Travels.update(selector, modifier, (error, result) => {
                        if (error) console.error(error);
                    });            
                }
            });
        }
    },
});

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Random } from 'meteor/random';

import moment from '/public/moment-with-locales.min.js';
import { sprintf } from 'sprintf-js';
import _ from 'lodash';

import { Messages } from '/imports/api/messages/collections.js';
import { Travels } from '/imports/api/travels/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';

import { build_waypoint, get_orientation_from_bearing } from '/imports/functions';

export const emit_signal = new ValidatedMethod({
    name: 'Messages::emit_signal',

    validate: new SimpleSchema({
        survey: { type: Object, blackbox: true },
    }).validator(),
        
    applyOptions: { noRetry: false },    

    run({ survey }) {

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
        const last = _.last(trip.data.waypoints)
        const mode = last.mode;
        const last_boarding = _.chain(trip.data.waypoints)
            .filter(o => o.type.code === 'board')
            .last()
            .value();

        const builder = {
            last: last, 
            type: { code: 'signal', label: 'Signal' }, 
            date: date, 
            point: survey.location, 
            mode: mode, 
            trajectory: trip.data.trajectory,
        };

        const waypoint = build_waypoint(builder);

        if (!waypoint) return;

        const fails = _.chain(Object.keys(survey))
            .filter(o => survey[o].code && survey[o].code === 'no')
            .map(o => survey[o].label)
            .value();
        
        let message = "";
        if (survey.isPT) {
            message += moment(last_boarding.date).format('HH:mm');
            message += sprintf(" %s\n", last_boarding.location.properties.label);
            message += sprintf("=> %s\n", last_boarding.mode.terminus.properties.label);
            message += sprintf("%.1f km, %s, %s\n", (waypoint.distance - last_boarding.distance)/1000, waypoint.orientation, last_boarding.mode.label);
        } else {
            message += moment(trip.data.origin.date).format('HH:mm');
            message += sprintf(" %s\n", trip.data.origin.location.properties.label);
            message += sprintf("=> %s\n", trip.data.destination.location.properties.label);
            message += sprintf("%.1f km, %s, %s\n", waypoint.distance/1000, waypoint.orientation, waypoint.mode.label);
        }
        message += fails.length > 0 ? "Problèmes :\n- " + _.join(fails, "\n- ") : "Tout va pour le mieux…";
        message += "\n#transport #signal, via @mobitweet_";

        const item = {
            meta: {
                createdAt: new Date(),
                userId: userId,  
                travelId: trip.meta.id, 
                id: id, 
                version: 1, 
            },
            data: {
                isSignal: true,
                date: date,
                message: message,
                theme: 'transport',
                bearing: survey.location.properties.bearing,
                orientation: survey.location.properties.orientation,
                mode: mode,
                user: null,
                tweet: null,
                source: {
                    survey: survey,
                    last_boarding: last_boarding,
                },
            },
            geoJSON: survey.location,
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

        if (Meteor.isServer) {
            import Twit from 'twit';
            const settings = _.find(Meteor.settings.API, { id: 'Twitter' });
            const mobitweet = new Twit({
                consumer_key:         settings.consumer_key,
                consumer_secret:      settings.consumer_secret,
                access_token:         settings.accessToken,
                access_token_secret:  settings.accessTokenSecret,
                timeout_ms:           60*1000,
            });
            if (user.services && user.services.twitter) {
                const participant = new Twit({
                    consumer_key:         settings.consumer_key,
                    consumer_secret:      settings.consumer_secret,
                    access_token:         user.services.twitter.accessToken,
                    access_token_secret:  user.services.twitter.accessTokenSecret,
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
            } else {
                message.replace(/\n?#[^#]+$/, '');
                mobitweet.post('statuses/update', { status: message }, Meteor.bindEnvironment(function(error, data, response) {
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
                    }
                }));
            }
        }
    },
});

import { Demographies } from '/imports/api/demographies/collections.js';
import { Messages } from '/imports/api/messages/collections.js';
import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';
import { Preferences } from '/imports/api/preferences/collections.js';
import { Travels } from '/imports/api/travels/collections.js';
import { Trajectories } from '/imports/api/trajectories/collections.js';

import { remove_mine as remove_demographies } from '/imports/api/demographies/methods';
import { remove_mine as remove_messages } from '/imports/api/messages/methods';
import { remove_mine as remove_od } from '/imports/api/origins-destinations/methods';
import { remove_mine as remove_preferences } from '/imports/api/preferences/methods';
import { remove_mine as remove_trajectories } from '/imports/api/trajectories/methods';
import { remove_mine as remove_travels } from '/imports/api/travels/methods';

export const subscriptions = [
    {
        collection: 'user',
        subscribe: self => self.subscribe('user_profile'),
        data: () => {
            const data = Meteor.user();
            delete(data.roles);
            return data;
        },
    },
    {
        collection: 'demographies',
        title: 'Mes enquêtes',
        mongo: () => Demographies,
        suppress: () => remove_demographies.call(),
    },
    {
        collection: 'messages',
        title: 'Mes messages',
        mongo: () => Messages,        
        suppress: () => remove_messages.call(),
    },
    {
        collection: 'origins-destinations',
        title: 'Mes origines-destinations',
        mongo: () => Origins_destinations,
        suppress: () => remove_od.call(),
    },
    {
        collection: 'preferences',
        title: 'Mes préférences',
        mongo: () => Preferences,
        suppress: () => remove_preferences.call(),
    },
    {
        collection: 'trajectories',
        title: 'Mes parcours',
        mongo: () => Trajectories,
        suppress: () => remove_trajectories.call(),
    },
    {
        collection: 'travels',
        title: 'Mes déplacements',
        mongo: () => Travels,
        suppress: () => remove_travels.call(),
    },
];
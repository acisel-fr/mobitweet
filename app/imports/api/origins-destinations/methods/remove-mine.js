import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Origins_destinations } from '/imports/api/origins-destinations/collections.js';
import { Trajectories } from '/imports/api/trajectories/collections.js';

export const remove_mine = new ValidatedMethod({
    name: 'origins-destinations::remove_mine',

    validate: null,
    
    applyOptions: { noRetry: true },    
    
    run() {

        const userId = Meteor.isServer ? this.userId : Meteor.userId();
        if (!userId) { return }

        const selector = { 'meta.userId': userId };

        Origins_destinations.remove(selector, (error) => {
            if (error) {
                console.error(error);
            } else {
                Trajectories.remove(selector, (error) => {
                    if (error) console.error(error);
                });
            }
        });

    },
});


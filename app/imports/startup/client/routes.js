import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '/imports/ui/authentication';
import '/imports/ui/collections';
import '/imports/ui/container';
import '/imports/ui/dashboard';
import '/imports/ui/data';
import '/imports/ui/empty';
import '/imports/ui/list';
import '/imports/ui/map';
import '/imports/ui/not-found';
import '/imports/ui/parameters';
import '/imports/ui/participate';
import '/imports/ui/surveys';

FlowRouter.route('/', {
    name: 'home',
    action() {
        FlowRouter.go('list');
    }    
});

FlowRouter.route('/about', {
    name: 'about',    
    action() {        
        BlazeLayout.render('container', { main: 'about' });            
    }                    
});                        

FlowRouter.route('/collections/:code', {
    name: 'collections',    
    action() {        
        BlazeLayout.render('map', { main: 'collections' });            
    }                    
});                        

FlowRouter.route('/map', {
    name: 'map',    
    action() {        
        BlazeLayout.render('map', { main: 'empty' });            
    }                    
});                        

FlowRouter.route('/list', {
    name: 'list',
    action() {
        BlazeLayout.render('map', { main: 'list'});
    }    
});    

FlowRouter.route('/dashboard', {
    name: 'dashboard',
    action() {
        BlazeLayout.render('map', { main: 'dashboard'});
    }    
});    

FlowRouter.route('/participate', {
    name: 'participate',
    action() {
        BlazeLayout.render('map', { main: 'participate'});
    }    
});    

FlowRouter.route('/parameters', {
    name: 'parameters',
    action() {
        BlazeLayout.render('map', { main: 'parameters'});
    }    
});    

FlowRouter.route('/authentication', {
    name: 'authentication',
    action() {
        BlazeLayout.render('map', { main: 'authentication' });
    }    
});    

FlowRouter.route('/data', {
    name: 'data',
    action() {
        BlazeLayout.render('map', { main: 'data' });
    }                        
});                        

FlowRouter.route('/surveys/:code', {
    name: 'surveys',
    action() {
        BlazeLayout.render('map', { main: 'surveys' });
    }
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('map', { main: 'not_found' });
    }
};

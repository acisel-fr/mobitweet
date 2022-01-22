#!/bin/bash

DB=mobitweet
PORT=27017
FILEPATH=$HOME/app/data

# Démarrer MongoDB

ulimit -n 4096 && mongod --config $FILEPATH/mongod.conf &

sleep 5

# Importer les collections des communes et des arrêts dans la base mobitweet

if [ -f "$FILEPATH/municipalities.json" ]; then    
    mongoimport --port $PORT --db $DB --collection municipalities --file $FILEPATH/municipalities.json &&
        mongo $DB --port $PORT --eval "db.municipalities.createIndex({ 'geoJSON.geometry': '2dsphere' })" && 
        mongo $DB --port $PORT --eval "db.municipalities.createIndex({ 'geoJSON.properties.CNTR_CODE': 1 })" &&
        rm $FILEPATH/municipalities.json
fi

if [ -f "$FILEPATH/places.json" ]; then    
    mongoimport --port $PORT --db $DB --collection places --file $FILEPATH/places.json &&
        mongo $DB --port $PORT --eval "db.places.createIndex({ 'geoJSON.geometry': '2dsphere' })" &&
        rm $FILEPATH/municipalities.json
fi

if [ -f "$FILEPATH/stops.json" ]; then    
    mongoimport --port $PORT --db $DB --collection stops --file $FILEPATH/stops.json &&
        mongo $DB --port $PORT --eval "db.stops.createIndex({ 'geoJSON.geometry': '2dsphere' })" &&
        mongo $DB --port $PORT --eval "db.stops.createIndex({ 'geoJSON.properties.contributor_id': 1 })" &&
        rm $FILEPATH/municipalities.json
fi

# Lancer l’application

MONGO_URL="mongodb://localhost:27017/mobitweet" meteor run --port 3000 --settings settings.json

'use strict';
module.change_code = 1;

const _ = require('lodash');
const Alexa = require('alexa-app');
const app = new Alexa.app('light');
const mqtt = require('mqtt');

//MQTT URL server
const MQTT_URL = 'mqtt://YOUR_BROKER_URL';
//MQTT connection
const client = mqtt.connect(MQTT_URL);
client.on('connect', function() {
    console.log("MQTT connected");
});

// MQTT topics
const lightsTopic = 'lights/salon';


app.launch(function(req, res) {
    var prompt = 'For lights command, tell me an on off order.';
    res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('LightControlIntent', {
        'slots': {
            'CMD': 'ONOFF'
        },
        'utterances': ['{|to turn|turn} {-|CMD}']
    },
    function(req, res) {
        //get the slot
        var order = req.slot('CMD');
        var reprompt = 'Tell me an on off order to switch lights.';
        if (_.isEmpty(order) || (order !== 'on' && order !== 'off')) {
            var prompt = 'I didn\'t hear an order. Tell me an on off order.';
            res.say(prompt).reprompt(reprompt).shouldEndSession(false);
            return true;
        } else {
            //MQTT sent
            console.log('Sent MQTT order ' +  order);
            let state = order==='on' ? {'state': 1} : {'state': 0};
            client.publish(lightsTopic, JSON.stringify(state));
            res.say('The light has been turn ' + order).send();
            return false;
        }

    }
);
//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
module.exports = app;

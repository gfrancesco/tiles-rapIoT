var http = require('http');
var request = require('request');

var mongoose = require('mongoose');
var Webhook = mongoose.model('Webhook');

var tilesApi = {};

tilesApi.getTimestamp = function(){
	var d = new Date();
	return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + 'T'
		+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
}

tilesApi.setDeviceState = function(tileId, userId, appid, state, active, name){
	if (tileId == null) {
		console.log("Tile ID can't be undefined or null");
		return;	
	}

	var fieldsToSend = {}; // Only send fields that are defined and not null
	fieldsToSend.timestamp = tilesApi.getTimestamp();
	fieldsToSend.tileId = tileId;
  	if (userId != null) fieldsToSend.userId = userId;
  	if (state != null) {
  		try {
  			fieldsToSend.state = JSON.parse(state);
		} catch (e) {
			console.log('JSON Parse Error: ' + e);
			fieldsToSend.state = state;
		}
  	}
  	if (active != null) fieldsToSend.active = active;
  	if (name != null) fieldsToSend.name = name;

  	tilesApi.triggerMatchingWebhooks(userId, tileId, appid, fieldsToSend);

	var data = JSON.stringify(fieldsToSend);
	console.log('POST: Sending device data: '+data);

	var options = {
	    port: 3000,
	    path: '/tiles',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/json',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var req = http.request(options, function(res) {
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
	        console.log("Response Body: " + chunk);
	    });
	});

	req.write(data);
	req.end();
}

tilesApi.triggerMatchingWebhooks = function(username, deviceId, appid, event){
	console.log("Trigger matching webhooks called!")
	Webhook.find({user: username, tile: deviceId, applicaton: appid}, function(err, docs) {
		if (!err){ 
	        console.log(docs);
	        for (var i = 0;i<docs.length;i++){
	        	console.log(docs[i].postUrl);
	        	tilesApi.triggerWebhook(docs[i].postUrl, event);
			}
	    } else { console.log(err); }
	});
}

tilesApi.triggerWebhook = function(url, data){
	request.post({
		url: url,
		json: data
	}, function(err, httpResponse, body){
		console.log("Sent " + JSON.stringify(data) + " to " + url);
		console.log("Response Body: " + body);
	});
}

module.exports = tilesApi;
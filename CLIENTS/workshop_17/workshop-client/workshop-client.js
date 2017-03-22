'use strict';
var TilesClient = require('./clients/tiles-client')
var HueClient = require('./clients/hue-client');
var EventReader = require('./clients/event-reader');
var PostmanClient = require('./clients/postman-client');
var IFTTTClient = require('./clients/ifttt-client');
var SpotifyClient = require('./clients/spotify-client');


var workshopClient = {
  TilesClient: TilesClient,
  EventReader: EventReader,
  HueClient: HueClient,
  PostmanClient: PostmanClient,
  IFTTTClient: IFTTTClient,
  SpotifyClient: SpotifyClient,
};

module.exports = workshopClient;
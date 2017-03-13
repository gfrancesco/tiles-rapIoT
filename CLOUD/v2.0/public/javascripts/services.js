/* Services */

angular.module('tilesApi.services', [])

	.factory('users', ['$http', function ($http) {
		var o = {
			users: []
		}

		o.getAll = function () {
			return $http.get('/users').success(function (data) {
				angular.copy(data, o.users);
			})
		}

		o.get = function (id) {
			return $http.get('/users/' + id).then(function (res) {
				return res.data;
			});
		}

		o.create = function (username) {
			return $http.post('/users', { _id: username }).success(function (data) {
				o.users.push(data);
			});
		}

		o.addTile = function (user, tileDeviceId) {
			return $http.post('/tiles', { tileId: tileDeviceId, userId: user._id }).success(function (data) {
				user.tiles.push(data)
			});
		}

		o.removeTile = function (user, tile) {
			return $http.delete('/users/' + user._id + '/tiles/' + tile._id).then(function (res) {
				var index = user.tiles.indexOf(tile);
				user.tiles.splice(index, 1);
			});
		}

		return o;
	}])

	.factory('tiles', ['$http', function ($http) {
		var o = {};

		o.get = function (userId, tileId) {
			return $http.get('/users/' + userId + '/tiles/' + tileId).then(function (res) {
				return res.data;
			});
		}

		return o;
	}])

	.factory('webhooks', ['$http', function ($http) {
		var o = {
			webhooks: []
		};

		o.getRegistered = function (userId, tileId) {
			return $http.get('/webhooks/' + userId + '/' + tileId).then(function (res) {
				angular.copy(res.data, o.webhooks);
			});
		}

		o.add = function (userId, tileId, postUrl) {
			return $http.post('/webhooks/' + userId + '/' + tileId, '{"postUrl": "' + postUrl + '"}').then(function (res) {
				o.webhooks.push(res.data);
			});
		}

		o.delete = function (webhook) {
			return $http.delete('/webhooks/' + webhook.user + '/' + webhook.tile + '/' + webhook._id).then(function (res) {
				var index = o.webhooks.indexOf(webhook);
				o.webhooks.splice(index, 1);
			});
		}

		return o;
	}])

	.factory('applications', ['$http', function ($http) {
		var o = {
			applications: []
		}

		o.getAll = function () {
			return $http.get('/applications').success(function (data) {
				angular.copy(data, o.applications);
			})
		}

		o.get = function (id) {
			return $http.get('/applications/' + id).then(function (res) {
				return res.data;
			});
		}

		o.create = function (appid, environment, username) {
			return $http.post('/applications', { _id: appid, devEnvironment: environment, user: username, environmentOnline: false, appOnline: false, port: 0 }).success(function (data) {
				o.applications.push(data);
			});
		}

		o.update = function (application, fieldsToUpdate) {
			return $http.post('/applications/' + application._id, fieldsToUpdate).success(function (data) {
				var index = o.applications.indexOf(application);

				for (k in data) {
					if (k != "user" && k != "virtualTiles") {
						if (o.applications[index]) o.applications[index][k] = data[k];
						if (application) application[k] = data[k];
					}
				}

				return data;
			});
		}

		o.delete = function (applicatoin) {
			return $http.delete('/applications/' + applicatoin._id).then(function (res) {
				var index = o.applications.indexOf(applicatoin);
				o.applications.splice(index, 1);
			});
		}

		o.addVirtualTile = function (application, virtualName) {
			return $http.post('/applications/' + application._id + '/virtualTile', { virtualName: virtualName }).success(function (data) {
				application.virtualTiles.push(data);
			});
		}

		o.removeVirtualTile = function (application, virtualTile) {
			return $http.delete('/applications/' + application._id + '/virtualTile/' + virtualTile._id).then(function (res) {
				var index = application.virtualTiles.indexOf(virtualTile);
				application.virtualTiles.splice(index, 1);
			});
		}

		o.toggleHostApplication = function (application) {
			return $http.get('/applications/' + application._id + '/host/workspace').then(function (res) {
				var index = o.applications.indexOf(application);

				application.port = res.data.port;
				application.environmentOnline = res.data.environmentOnline;

				if (o.applications[index]) {
					o.applications[index].port = res.data.port;
					o.applications[index].environmentOnline = res.data.environmentOnline;
				}

				return res.data;
			});
		}

		o.toggleRunApplication = function (application) {
			return $http.get('/applications/' + application._id + '/host/app').then(function (res) {
				var index = o.applications.indexOf(application);

				application.appOnline = res.data.appOnline;

				if (o.applications[index]) {
					o.applications[index].appOnline = res.data.appOnline;
				}

				return res.data;
			});
		}

		// TODO: Remove?
		// o.addTile = function(user, tileDeviceId) {
		// 	return $http.post('/tiles', {tileId: tileDeviceId, userId: user._id}).success(function(data){
		//     	user.tiles.push(data)
		// 	});
		// }

		// o.removeTile = function(user, tile) {
		// 	return $http.delete('/users/' + user._id + '/tiles/' + tile._id).then(function(res){
		// 		var index = user.tiles.indexOf(tile);
		// 		user.tiles.splice(index, 1);
		// 	});
		// }

		return o;
	}])

	.factory('apphooks', ['$http', function ($http) {
		var o = {
			tilehooks: [],
			ifttthooks: []
		}

		o.getIfttthooks = function (appid) {
			return $http.get('/ifttt/' + appid).then(function (res) {
				angular.copy(res.data, o.ifttthooks);
				// return res.data;
			});
		}
		o.addIfttthook = function (appid, virtualTile, triggerName, trigger, properties, outgoing) {
			var data = JSON.stringify({
				triggerName: triggerName,
				properties: properties,
				trigger: trigger,
				outgoing: outgoing
			});
			return $http.post('/ifttt/' + appid + '/' + virtualTile, data).then(function (res) {
				o.ifttthooks.push(res.data);
			});
		}
		o.deleteIfttthook = function (ifttthook) {
			return $http.delete('/ifttt/' + ifttthook.application + '/hook/' + ifttthook._id).then(function (res) {
				var index = o.ifttthooks.indexOf(ifttthook);
				o.ifttthooks.splice(index, 1);
			});
		}

		o.getTilehooks = function (appid) {
			// return $http.get('/tilehooks/' + appid).then(function (res) {
			// 	angular.copy(res.data, o.tilehooks);
			// });
		}
		o.addTilehook = function (appid, virtualTile) {

		}
		o.deleteTilehook = function (hookId) {

		}

		return o;
	}]);
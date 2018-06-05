var Twitter = require('twitter'),
	Promise = require('bluebird'),
	twitterConfig = require('../config.json');

var client = new Twitter(twitterConfig);

var Twitter = module.exports = {
	Client: client,
	getUserInfoByScreenName: getUserInfoByScreenName
}



function getUserInfoByScreenName(screenNamesCommaSeparated) {
	return new Promise(function(resolve, reject) {
		if (!screenNamesCommaSeparated) {
			return resolve([]);
		} else {
			var params = {
				screen_name: screenNamesCommaSeparated
			};

			client.get('users/lookup', params, function(error, users, response) {
				if (error)
					return reject(error);
				else
					return resolve(users);
			});
		}

	})

}
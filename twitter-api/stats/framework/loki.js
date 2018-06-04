var loki = require('lokijs'),
	fs = require('fs');


var LOKI_DB_PATH = "/data/tweetstore.db";



var lokiDB = module.exports = {
	init: init,
	insertHashtag: insertHashtag,
	updateHashtag: updateHashtag,
	findAllHashtag: findAllHashtag
}



function init() {

	if (!fs.existsSync(LOKI_DB_PATH)) {
		console.log('LOKI_DB_PATH does not exist.')
	}

	var db = new loki(LOKI_DB_PATH, {
		autosaveInterval: 1000,
		autosave: true,
		autoload: true,
		// autoloadCallback: databaseLoaded,
		autoloadCallback: databaseInitialize
	});

	function databaseInitialize() {
		var hashtag = db.getCollection("hashtag");
		if (hashtag === null) {
			db.addCollection("hashtag");
		}
		console.log('database initialized.')
	}

	function databaseLoaded() {
		console.log('database loaded.')
	}

	lokiDB.Client = db;
}


function insertHashtag(hashtag) {
	var hashtagCollection = lokiDB.Client.getCollection("hashtag");
	console.log(hashtagCollection)
	var hashtagData = hashtagCollection.find({
		'hashtag': hashtag
	})

	console.log(hashtagData)

	if (hashtagData.length == 0) {
		hashtagCollection.insert({
			"hashtag": hashtag,
			"startTime": new Date().getTime()
		})
		updateDatabase(lokiDB.Client);
	}

}


function updateHashtag(hashtag) {
	var hashtagCollection = lokiDB.Client.getCollection("hashtag");

	hashtagCollection.findAndUpdate({
			'hashtag': hashtag
		},
		function(r) {
			r.endTime = new Date().getTime();
			return r;
		})
	updateDatabase(lokiDB.Client)
}


function findAllHashtag() {
	var hashtagCollection = lokiDB.Client.getCollection("hashtag");
	return hashtagCollection.find({});
}

function updateDatabase(db) {
	db.saveDatabase(function(err) {
		if (err) {
			console.log("error : " + err);
		} else {
			console.log("database saved.");
		}
	});
}

// setTimeout(function() {
// 	console.log(insertHashtag("ad9"))
// 	console.log(findAllHashtag())
// }, 5000)
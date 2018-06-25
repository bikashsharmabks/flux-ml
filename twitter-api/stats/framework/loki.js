var loki = require('lokijs'),
	fs = require('fs');


var LOKI_DB_PATH = "/data/tweetstore.db";



var lokiDB = module.exports = {
	init: init,
	insertHashtag: insertHashtag,
	updateHashtag: updateHashtag,
	findAllHashtag: findAllHashtag,
	updateGenderCount: updateGenderCount,
	getGenderCount:getGenderCount
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
		var genderCount = db.getCollection("genderCount");

		if (hashtag === null) {
			db.addCollection("hashtag");
		}

		if (genderCount === null) {
			db.addCollection("genderCount");
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


function updateGenderCount(hashtag, gender) {
	var genderCountCollection = lokiDB.Client.getCollection("genderCount");
	var genderCountData = genderCountCollection.find({
		'hashtag': hashtag
	})

	if (genderCountData.length == 0) {
		genderCountCollection.insert({
			"hashtag": hashtag,
			"maleCount": 0,
			"femaleCount": 0,
			"unknownCount": 0
		})
		updateDatabase(lokiDB.Client);
	}

	genderCountCollection.findAndUpdate({
			'hashtag': hashtag
		},
		function(r) {
			if(gender == 'male')
				r.maleCount = r.maleCount + 1;
			else if (gender == 'female') {
				r.femaleCount = r.femaleCount + 1;
			}else{
				r.unknownCount = r.unknownCount +1;
			}
			return r;
		})
	updateDatabase(lokiDB.Client)
}

function getGenderCount(hashtag) {
	var genderCountCollection = lokiDB.Client.getCollection("genderCount");
	return genderCountCollection.findOne({"hashtag":hashtag});
}

// setTimeout(function() {
// 	console.log(updateGenderCount("ad9","male"))
// 	console.log(getGenderCount("ad9"))
// }, 5000)
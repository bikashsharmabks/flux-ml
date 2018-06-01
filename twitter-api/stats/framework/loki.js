var loki = require('lokijs');



var lokiDB = module.exports = {
	init: init,
	insertHashtag: insertHashtag,
	updateHashtag: updateHashtag,
	findAllHashtag: findAllHashtag
}


function init() {

	var db = new loki('/data/loki/lokistore.db', {
		autoload: true,
		autoloadCallback: databaseInitialize,
		autosave: true,
		autosaveInterval: 1000
	});

	function databaseInitialize() {
		var hashtag = db.getCollection("hashtag");
		if (hashtag === null) {
			db.addCollection("hashtag");
		}
	}

	lokiDB.Client = db;

}


function insertHashtag(hashtag) {
	var hashtagCollection = lokiDB.Client.getCollection("hashtag");

	var hashtagData = hashtagCollection.find({
		'hashtag': hashtag
	})

	if (hashtagData.length == 0) {
		hashtagCollection.insert({
			"hashtag": hashtag,
			"startTime": new Date().getTime()
		})
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
}


function findAllHashtag() {
	var hashtagCollection = lokiDB.Client.getCollection("hashtag");
	return hashtagCollection.find({});
}
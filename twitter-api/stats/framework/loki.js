var loki = require('lokijs');



var Loki = module.exports = {
	init: init,
	insertHashtag: insertHashtag,
	updateHashtag: updateHashtag
}


function init() {

	var db = new loki('lokistore.db', {
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
	var hashtag = lokiDB.Client.getCollection("hashtag");

	var hashtagData = hashtag.find({
		'hashtag': hashtag
	})

	if (hashtagData.length == 0) {
		hashtag.insert({
			hashtag: hashtag,
			startTime: new Date().getTime()
		})
	}
}



function updateHashtag(hashtag) {
	var hashtag = lokiDB.Client.getCollection("hashtag");
	
	hashtag.findAndUpdate({
			'hashtag': hashtag
		},
		function(r) {
			r.endTime = new Date().getTime();
			return r;
		})
}
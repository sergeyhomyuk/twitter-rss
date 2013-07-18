var express = require('express');
var Twit = require('twit');
var Feed = require('feed');
var twitterApiConfig = require('./twitter-api.config');
var feedConfig = require('./feed.config');

var twitterApi = new Twit(twitterApiConfig);

var app = express();

app.get('/favorites/:user/:count?', function(req, res){
	var user = req.params.user;
	var itemsCount = req.params.count || feedConfig.defaultItemsCount;
	if (itemsCount > feedConfig.maxItemsCount)
		itemsCount = feedConfig.maxItemsCount;

	var feed = new Feed(feedConfig.feedDescription);

	var filterOptions = { 
		count: itemsCount, 
		screen_name: user
	};

	twitterApi.get('/favorites/list', filterOptions, function(err, response) {
	  if(err) {
	  	console.log(err);
	  	res.send(feedRss);
	  }

	  for (var i = 0; i < response.length; i++) {
	  	var tweet = response[i];
		feed.item({
		        title: tweet.text,
		        link: 'https://twitter.com/'+ tweet.user.screen_name +'/status/' + tweet.id_str,
		        description: tweet.text,
		        author: [
		            {
		                name: tweet.user.name + ' (@' + tweet.user.screen_name + ')',
		                link: 'https://twitter.com/' + tweet.user.screen_name
		            }
		        ],
		        date: new Date(tweet.created_at)
		    });  	
	  };
	  
	  var feedRss = feed.render(feedConfig.outputFormat);
	  res.send(feedRss);
	});	  
});

var port = process.env.PORT || 1337;
app.listen(port);

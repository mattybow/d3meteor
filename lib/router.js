Router.configure({
	layoutTemplate:'layout',
	loadingTemplate:'loadCircles'
});

Router.route('/',{
	name:'vis1',
	"onStop":function(){
		Meteor.Dispatcher.emit('cancelInterval');
	}
});
Router.route('/bar',{
	name:'barChart',
	waitOn:function(){return Meteor.subscribe('barData');}
});
Router.route('/charBar',{
	name:'charBarChart',
	waitOn:function(){return [
		Meteor.subscribe('charData'),
		Meteor.subscribe('excerptData')
		];}
});
Router.route('/charBar/twitterStream/:hashtag',{where: 'server'})
	.get(function(){
		var hashTag = this.params.hashtag;
		var stream = Twit.stream('statuses/filter',{track:hashTag,language:'en'});
		stream.on('tweet',function(tweet){
				console.log(tweet.text);
				twStream.emit(hashTag,tweet);
			}.bind(this)
		);
		Meteor.setTimeout(function(){
			stream.stop();
		}.bind(this),15000);
		this.response.end('we subscribed you to #'+hashTag);
	});
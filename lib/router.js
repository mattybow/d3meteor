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
		var stream = Twit.stream('statuses/filter',{track:this.params.hashtag,language:'en'});
		stream.on('tweet',function(tweet){
			console.log(tweet);
		});
		Meteor.setTimeout(function(){
			stream.stop();
		}.bind(this),10000);
		this.response.end('we subscribed you to #'+this.params.hashtag);
	});
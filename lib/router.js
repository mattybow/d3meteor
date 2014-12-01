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

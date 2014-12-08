//console.log('main.js ran');
if(Meteor.isClient){
	Meteor.Dispatcher = new EventEmitter();
}

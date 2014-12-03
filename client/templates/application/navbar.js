Template.navbar.events({
	'click .navigation':function(e){
		console.log('click on navbar');
	}
});

Template.navbar.rendered=function(){
	console.log('navbar rendered');
};
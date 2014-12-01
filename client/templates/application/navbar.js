Template.navbar.rendered=function(){
	console.log('navbar rendered');
};

Template.navbar.events({
	'click .navigation':function(e){
		console.log('click on navbar');
	},
	'click a':function(e){
		//e.stopPropagation();
		console.log('click on a tag');
	}
});
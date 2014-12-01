
Template.vis1.rendered=function(){

	var svg = d3.select('#vis1-svg').append('g');
	var PERIOD=300;

	var cycler = setInterval(function(){
		var data =[];
		for(var i =0;i<4;i++){
			data.push(Math.round(Math.random()*255));
		}
		
		var circle = svg.selectAll('circle')
						.data(data);							//bind data to cicles
		var circleEnter = circle.enter().append('circle');		//for new values, add a circle

		circle
			.attr("cy", 60)
			.attr("cx", function(d,i) { return i*100+50; })
			.transition()
			.duration(PERIOD)
			.attr('r',function(d){return Math.sqrt(d);})
			.style('fill',function(d){return 'rgba(100'+','+d+','+d+',1)';});

		circle.exit().remove();
	}.bind(this),PERIOD);

	Meteor.Dispatcher.on('cancelInterval',function(){
		clearInterval(cycler);
	}.bind(this));

};

Template.vis1.events({
	'click':function(){
		console.log('vis1 click');
	}
});
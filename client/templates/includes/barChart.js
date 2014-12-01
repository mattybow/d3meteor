Template.barChart.rendered=function(){

	_setObserver();
	_renderChart();

	function _setObserver(){
		BarData.find().observe({
			changed:function(bar){
				_renderChart();
			}
		});
	}

	function _renderChart(){
		var data = BarData.find().fetch();
		
		var width = 420,
			barHeight = 20;

		/*console.log(d3.max(data,function(d){
											return d.value;
								}));*/

		var x = d3.scale.linear()
				.domain([0,d3.max(data,function(d){
											return d.value;
								})
						])
				.range([0,width]);

		var chart = d3.select('.hor-chart')
					.attr('width',width)
					.attr('height',barHeight*data.length);

		var bar = chart.selectAll('g')
			.data(data,function(d){return d._id;});

		//console.log(bar.enter());

		var group = bar.enter().append('g')
			.attr('transform',function(d,i){return 'translate(0,'+i*barHeight + ')';});

		group.append('rect')
			.attr('width',function(d){return x(d.value);})
			.attr('height',barHeight-1);

		group.append('text')
			.attr('x',function(d){return x(d.value)-3;})
			.attr('y',barHeight/2)
			.attr('dy','.30em')
			.text(function(d){return d.value;});

		bar.exit().remove();

		var rects = bar.selectAll('rect').data(data,function(d){return d._id;});
		rects.transition()
			.duration(500)
			.attr('width',function(d){
				//console.log(d.value,x(d.value));
				return x(d.value);
			});
		var texts = bar.selectAll('text').data(data,function(d){return d._id;});
		texts.transition()
			.duration(500)
			.attr('x',function(d){return x(d.value)-3;})
			.text(function(d){return d.value;});
	}
};


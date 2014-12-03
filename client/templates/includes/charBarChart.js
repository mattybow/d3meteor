Template.charBarChart.rendered=function(){

	var domObj = this.find('#testSurf');
	var context = famous.core.Engine.createContext(domObj);
	var surf = new famous.core.Surface({
		content:"here's a friggin surface",
		size:[400,400],
		properties:{
			backgroundColor:'papayawhip',
			textAlign:'center',
			padding:'200px 200px'
		}
	});
	context.add(surf);

	_setSession();
	_setObserver();
	_renderChart();

	function _setObserver(){
		CharData.find().observe({
			changed:function(bar){
				_renderChart();
			}
		});
	}

	function _setSession(){
		Session.setDefault('showAll', true);
	}

	function _uniqVals(data){
		return _.chain(data).pluck('letter').uniq(true).value();
	}

	function _renderChart(){
		var data = CharData.find().fetch();

		var margin = {top: 20, right: 30, bottom: 30, left: 40},
			width = 960 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

		var y = d3.scale.linear()
				.domain([0,d3.max(data,function(d){
											return d.frequency;
								})
						])
				.range([height,0]);

		//console.log(_uniqVals(data));

		var x = d3.scale.ordinal()
				.domain(_uniqVals(data))
				.rangeRoundBands([0,width],0.1);

		var chart = d3.select('.vert-chart')
					.attr("viewBox", '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom))
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					

		var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom");

		var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.ticks(10, "%");

		var bars = chart.selectAll('.bar')
			.data(data,function(d){return d._id;});

		bars.enter()														//new bars
			.append('rect')
				.attr('x',function(d){return x(d.letter); })
				.attr('y', height)
				.attr('height',0)
				.attr('class','bar')
				.attr('width',x.rangeBand());

		bars.transition()													//update bars
			.duration(500)
			.ease('elastic')
			.attr('y', function(d) { return y(d.frequency); })
			.attr('height',function(d){return height-y(d.frequency);});

		bars.exit().remove();

		/*var rects = bar.selectAll('rect').data(data,function(d){return d._id;});
		rects.transition()
			.duration(500)
			.attr('height',function(d){
				//console.log(d.frequency,x(d.frequency));
				return height-y(d.frequency);
			});*/


		//RENDER AXES
		chart.append('g')
			.attr('class','x axis')
			.attr('transform', 'translate(0,'+height+')')
			.call(xAxis);

		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Frequency");

	}
};

Template.charBarChart.helpers({
	excerpt:function(){
		return ExcerptData.find({},{fields:{title:1}});
	},
	isSelected:function(){
		var result='not-shown';
		var selected=Session.get('selectedText');
		if(selected === this.valueOf()._id || selected === undefined ){
			result = 'shown';
		}
		return result;
	},
	getText:function(){
		var selected = Session.get('selectedText');
		if(selected){
			return ExcerptData.findOne({_id:selected},{bodyText:1,_id:0}).bodyText;
		} else {
			return 'nothing found';
		}
	}
});

Template.charBarChart.events({
	'click li':function(ev){
		var selected_id = this.valueOf()._id;
		var parent = $(ev.target).parent('li');
		parent.addClass('selected');
		Session.set('selectedText',selected_id);
		var pos = parent.position().top;
		parent.css('transform',"translateY(-"+pos+"px)").blur();
	}
});
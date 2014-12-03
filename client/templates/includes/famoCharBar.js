Template.famoCharBar.rendered=function(){

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

	_initialize();

	function _initialize(){
		CharData.find().observe({
			changed:function(bar){
				renderChart();
			}
			/*added:function(){
				renderChart();
			}*/
		});

		Tracker.autorun(function(){
			//console.log('tracker autorun');
			renderChart(getDocName());
		});
	}

};

function getDocName(){
	var docName;
	var doc = ExcerptData.findOne({_id:Session.get('selectedText')});
	//console.log(doc);
	if(_.isEmpty(doc)){
		docName = 'default';
	} else {
		docName = doc.title;
	}
	return docName;
}

function uniqVals(data){
	return _.chain(data).pluck('letter').uniq(true).value();
}

function renderChart(doc){
	if(!doc) doc = 'default';
	//console.log(doc);
	var data = CharData.find({doc:doc}).fetch();

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
			.domain(uniqVals(data))
			.rangeRoundBands([0,width],0.1);

	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

	var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(10, "%");

	var chart = d3.select('.vert-chart g');

	if(chart[0][0]===null){
		chart = d3.select('.vert-chart')
				.attr("viewBox", '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom))
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

	var bars = chart.selectAll('.bar')
		.data(data,function(d){return d.letter;});

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
		.attr('height',function(d){return Math.max(height-y(d.frequency),0);});

	bars.exit().remove();

	/*var rects = bar.selectAll('rect').data(data,function(d){return d._id;});
	rects.transition()
		.duration(500)
		.attr('height',function(d){
			//console.log(d.frequency,x(d.frequency));
			return height-y(d.frequency);
		});*/

}

Template.famoCharBar.helpers({
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
			var resultSet = ExcerptData.findOne({_id:selected},{bodyText:1,title:1,_id:0});
			var dataExists = CharData.find({doc:resultSet.title}).count();
			if(!dataExists){
				setTimeout(function(){
					parseText(resultSet);
				}.bind(this),1);
			}
			return resultSet.bodyText;
		} else {
			return 'nothing found';
		}
	},
	showText:function(){
		if(Session.get('selectedText')!==undefined){
			return 'show';
		} else {
			return '';
		}
	}
});

function parseText(input){
	var counts = {};
	var totalChars = 0;
	var charCounts = [];
	//console.log('PARSING',new Date().getTime());
	_.each(input.bodyText,function(ch){
		if(ch in counts){
			counts[ch]+=1;
		} else {
			counts[ch]=1;
		}
	});
	_.each('ABCDEFGHIJKLMNOPQRSTUVWXYZ',function(letter){
		var upperCount = counts[letter];
		if (upperCount ===undefined) upperCount=0;
		var lowerCount = counts[letter.toLowerCase()];
		if (lowerCount ===undefined) lowerCount=0;
		var count = upperCount + lowerCount;
		var obj={};
		obj[letter]=count;
		totalChars += count;
		charCounts.push(obj);
	});
	//console.log('PARSING COMPLETE',new Date().getTime());
	var doc = input.title;
	_.each(charCounts,function(obj){
		for (var letter in obj){
			CharData.insert({letter:letter,frequency:obj[letter]/totalChars,doc:doc});
		}
	});
}

Template.famoCharBar.events({
	'click li':function(ev){
		var selected_id = this.valueOf()._id;
		var parent = $(ev.target).closest('li');
		var pos = parent.position().top;
		if(pos!==0){
			parent.addClass('selected');
			Session.set('selectedText',selected_id);
			setTimeout(function(){
				parent.css('transform',"translate(0,-"+pos+"px)").blur();
				$('#text-holder').addClass('show');
			}.bind(this),200);
		}
	},
	'click .close-text':function(ev){
		ev.stopPropagation();
		var parent = $(ev.target).closest('li');
		parent.css('transform','').blur();
		$('#text-holder').removeClass('show');
		parent.removeClass('selected');
		setTimeout(function(){
			Session.set('selectedText',undefined);
		}.bind(this),200);
	}
});
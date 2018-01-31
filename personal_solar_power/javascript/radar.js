function radarChart(radarData) {
	// define tooltip that shows the value of every radar chart category
	radarTip = d3.tip()
		.attr("class", "tip")
		.offset([-12, 0])
		.html(function(d) {
			return "<strong>Score:<strong> <span>" + parseInt(d.value*10) + "</span>";
		});

	// radar chart parameters
	var options = {
		w: radarWidth,
		h: radarHeight,
		margin: radarMargin,
		maxValue: 1,
		levels: 5,
		roundStrokes: true,
		color: "orange"
	};

	// more detailed radar chart parameter object
	cfg = {
		w: radarWidth,				//Width of the circle
		h: radarHeight,				//Height of the circle
		margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
		levels: 3,				//How many levels or inner circles should there be drawn
		maxValue: 0, 			//What is the value that the biggest circle will represent
		labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
		opacityArea: 0.5, 	//The opacity of the area of the blob
		dotRadius: 4, 			//The size of the colored circles of each blog
		opacityCircles: 0.1, 	//The opacity of the circles of each blob
		strokeWidth: 2, 		//The width of the stroke around each blob
		roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
		color: "orange"		//Color function
	};

	// put all of the options into a variable called cfg
	if('undefined' !== typeof options){
		for(var i in options){
			if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
		}//for i
	}//if

	// if the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));

	// radar chart dimensions
	var allAxis = (radarData[0].map(function(i, j){return i.axis})),	
		total = allAxis.length,					
		radius = Math.min(cfg.w/2, cfg.h/2), 	
		angleSlice = Math.PI * 2 / total;
			
	// scale for the radar chart radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	// wrapper for the grid & axes
	var axisGrid = gRadar.append("g").attr("class", "axisWrapper");
		
	// draw the radar background circles
	axisGrid.selectAll(".levels")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter()
		.append("circle")
			.attr("class", "gridCircle")
			.attr("r", function(d, i){return radius/cfg.levels*d;})
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", function(d, i) { if ((radius/cfg.levels*d) == 260) {
				return "4px";
			}}); 
					
	// create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
		
	// append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "black")
		.style("stroke-width", "2px");

	// append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "13px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ if (d == "Oriëntatie") {
			return rScale(maxValue * 1.15) * Math.sin(angleSlice*i - Math.PI/2)
		} 
		else {
			return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2) }
		})
		.text(function(d) {return d});	
}
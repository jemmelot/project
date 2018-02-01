function radarChart(radarData) {
	// select svg to put radar chart into
	svgRadar = d3.select("#radar"),
		radarMargin = {top: 70, right: 70, bottom: 80, left: 80},
		radarWidth = 550 - radarMargin.left - radarMargin.right,
		radarHeight = 550 - radarMargin.top - radarMargin.bottom,
		gRadar = svgRadar.append("g").attr("transform", "translate(" + (radarWidth/2 + radarMargin.left) + "," + (radarHeight/2 + radarMargin.top) + ")");	
	
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
		w: radarWidth,
		h: radarHeight,
		margin: {top: 20, right: 20, bottom: 20, left: 20},
		levels: 3,
		maxValue: 0,
		labelFactor: 1.25,
		wrapWidth: 60,
		opacityArea: 0.5,
		dotRadius: 4,
		opacityCircles: 0.1,
		strokeWidth: 2,
		roundStrokes: false,
		color: "orange"
	};

	// put all of the options into a variable called cfg
	if('undefined' !== typeof options){
		for(var i in options){
			if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
		}
	}

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
		
	// add wrapper for the grid and axes
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
					
	// define the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
		
	// append the straight lines
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
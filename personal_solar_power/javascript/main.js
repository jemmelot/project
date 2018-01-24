/*
	Jesse Emmelot
	11963522

	Code sources:
	- http://bl.ocks.org/phil-pedruco/9344373
	- http://bl.ocks.org/phil-pedruco/7745589
	- https://www.w3schools.com/
	- https://www.bootply.com/113296
	- https://github.com/MasterMaps/d3-slider
	- http://bl.ocks.org/tpreusse/2bc99d74a461b8c0acb1
	- https://codepen.io/shellbryson/pen/KzaKLe
	- http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3
	- https://codepen.io/numberformat/pen/QjLeLP?editors=0110
	- https://gist.github.com/nbremer/21746a9668ffdf6d8242#file-radarchart-js
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
	- https://woonbewust.nl/blog/soorten-zonnepanelen
	- https://www.zonne-paneel.net/prijs-zonnepanelen/
	- http://www.sun-solar.nl/index.php/product/solar-frontier-sf175-s-paneel-135-euro-incl-btw-sunsolar/
*/

var monthValue = "Jaar";
var station = "";
var monthTotalTemp = 0;
var monthTotalRad = 0;

// array of month abbreviations to check which array within a station object to load data from
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jaar"];	

var yDomainMin;
var yDomainMax;

var xDomainMin;
var xDomainMax;

// variables to keep track of checkbox statuses
var radioStatus = 0;

var radarData = [
	[
		{axis: "Oriëntatie", value: 0},
		{axis: "Dakhoek", value: 0},
		{axis: "Dakoppervlak", value: 0},
		{axis: "Rendement", value: 0},
		{axis: "Verbruik", value: 0},								
	]
];

// define map size
var mapWidth = 390;
var mapHeight = 450;

var format = d3.time.format("%Y-%b-%d").parse;

// set map projection type
var projection = d3.geo.mercator()
	.scale(1)
	.translate([0,0]);

// set map path
var path = d3.geo.path()
	.projection(projection);

// add an svg element to put the map into	
var svgNL = d3.select("body").append("svg")
	.attr("width", mapWidth)
	.attr("height", mapHeight)

// add an svg element to put the line chart into	
var svgChart = 	d3.select("#chart")
	chartMargin = {top: 30, right: 20, bottom: 10, left: 50},
	chartWidth = 800 - chartMargin.left - chartMargin.right,
	chartHeight = 240 - chartMargin.top - chartMargin.bottom,
    gChart = svgChart.append("g").attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
	
//Initiate the radar chart SVG
var svgRadar = d3.select("#radar")
	radarMargin = {top: 70, right: 70, bottom: 80, left: 80},
	radarWidth = 670 - radarMargin.left - radarMargin.right,
	radarHeight = 670 - radarMargin.top - radarMargin.bottom,
	gRadar = svgRadar.append("g").attr("transform", "translate(" + (radarWidth/2 + radarMargin.left) + "," + (radarHeight/2 + radarMargin.top) + ")");	
	
var options = {
	w: radarWidth,
	h: radarHeight,
	margin: radarMargin,
	maxValue: 1,
	levels: 5,
	roundStrokes: true,
	color: "orange"
};

var cfg = {
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

//Put all of the options into a variable called cfg
if('undefined' !== typeof options){
	for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	}//for i
}//if

//If the supplied maxValue is smaller than the actual one, replace by the max in the data
var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));

var allAxis = (radarData[0].map(function(i, j){return i.axis})),	//Names of each axis
	total = allAxis.length,					//The number of different axes
	radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
	angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
		
//Scale for the radius
var rScale = d3.scale.linear()
	.range([0, radius])
	.domain([0, maxValue]);
	
//Wrapper for the grid & axes
var axisGrid = gRadar.append("g").attr("class", "axisWrapper");
	
//Draw the background circles
axisGrid.selectAll(".levels")
	.data(d3.range(1,(cfg.levels+1)).reverse())
	.enter()
	.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "none")
		.style("stroke", "black")
		.style("stroke-width", function(d, i) { if ((radius/cfg.levels*d) == 260) {
			return "3px";
		}}); 
				
//Create the straight lines radiating outward from the center
var axis = axisGrid.selectAll(".axis")
	.data(allAxis)
	.enter()
	.append("g")
	.attr("class", "axis");
	
//Append the lines
axis.append("line")
	.attr("x1", 0)
	.attr("y1", 0)
	.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
	.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
	.attr("class", "line")
	.style("stroke", "black")
	.style("stroke-width", "2px");

//Append the labels at each axis
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

function updateRadar(radarData, cfg) {
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));

	var allAxis = (radarData[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
			
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });	
	
	//Create a wrapper for the blobs	
	var blobWrapper = gRadar.selectAll(".radarWrapper")
		.data(radarData)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	// Colored backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", "orange")
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", "orange")
		.style("fill", "none")
			
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "orange")
		.style("fill-opacity", 0.8);

	//Wrapper for the invisible circles on top
	var blobCircleWrapper = gRadar.selectAll(".radarCircleWrapper")
		.data(radarData)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(d.value)
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = gRadar.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);	
};
		
var xDomain;
var yDomain;	
	
var x = d3.time.scale()
	.rangeRound([0, chartWidth])
	
var y = d3.scale.linear()
	.rangeRound([chartHeight, 0])
		
var line = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.stats); });
	
// line chart x axis properties		
var	xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
	
// line chart y axis properties	
var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");		
		
// queue weather station data and map data
d3.queue()
	.defer(d3.json, "datasets/data.json")
	.defer(d3.json, "datasets/map.json")
	.defer(d3.json, "datasets/percentages.json")
	.await(ready);
	
function ready(error, data, nld, percentages) {
	Object.keys(data).forEach(function(key,index) {
		Object.keys(data[key].dates).forEach(function(part,index) {
			data[key].dates[part].forEach(function(d) {
				d.date = format(d.date);
				d.temperature = +d.temperature;
				d.radiation = +d.radiation;
			});			
		})
	});
		
	console.log(data);
	console.log(percentages);

	lineData = []
		
	gChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + chartHeight + ")")
		.call(xAxis)
		.select(".domain")
			.remove();
		
	gChart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
				
	gChart.append("path")
		.attr("class", "lines")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);
		
	var focus = gChart.append('g')
		.style('display', 'none');
                
	focus.append('line')
		.attr('id', 'focusLineX')
		.attr('class', 'focusLine');
	focus.append('line')
		.attr('id', 'focusLineY')
		.attr('class', 'focusLine');
	focus.append('circle')
		.attr('id', 'focusCircle')
		.attr('r', 5)
		.attr('class', 'circle focusCircle');
	focus.append('text')	
		.attr('id', 'focusTextX')
		.attr("x", 9)
		.attr("dy", ".35em");
	focus.append('text')	
		.attr('id', 'focusTextY')
		.attr("x", 9)
		.attr("dy", ".35em");	
		
	var bisectDate = d3.bisector(function(d) { return d.date; }).left;
	
	// functions on checkbox clicks
	$(".radio-temperature").on("click", function() {
		radioStatus = 0;
		updateLine(station, monthValue, radioStatus);			
	})
	
	// functions on checkbox clicks
	$(".radio-radiation").on("click", function() {
		radioStatus = 1;
		updateLine(station, monthValue, radioStatus);		
	})
	
	function updateLine(station, monthValue, radioStatus) {
		
		if (monthValue == "Jaar") {
			lineData = [];
			
			for (var i = 0; i < ((months.length) - 1); i++) {
				for (var j = 0; j < data[station].dates[months[i]].length; j++) {
					lineData.push(data[station].dates[months[i]][j]);
				}
			}			
		}
		
		else {
			lineData = data[station].dates[monthValue]
		}
						
		var newLine = d3.select("#chart").transition();
		
		if (radioStatus == 0) {	
			var lineColor = "red";
			
			lineData.forEach(function(d) {
				d.stats = d.temperature;				
			});
			
			xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
			yDomain = y.domain(d3.extent(lineData, function(d) { return d.stats; }));
			
			xDomainMin = 0;
			xDomainMax = lineData.length;
			
			yDomainMin = d3.min(lineData, function(d) { return d.stats; });
			yDomainMax = d3.max(lineData, function(d) { return d.stats; });
			
			newLine.select(".lines")
				.duration(500)
				.attr("d", line(lineData))
				.attr("stroke", lineColor)
				.attr("fill", "none");
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis);
			newLine.select(".y.axis")
				.duration(500)
				.call(yAxis);
		};
		
		if (radioStatus == 1) {
			var lineColor = "yellow";
			
			lineData.forEach(function(d) {
				d.stats = d.radiation;				
			});	
				
			xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
			yDomain = y.domain(d3.extent(lineData, function(d) { return d.stats; }));
		
			xDomainMin = 0;
			xDomainMax = lineData.length;
		
			yDomainMin = d3.min(lineData, function(d) { return d.stats; });
			yDomainMax = d3.max(lineData, function(d) { return d.stats; });
		
			newLine.select(".lines")
				.duration(500)
				.attr("d", line(lineData))
				.attr("stroke", lineColor)
				.attr("fill", "none");
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis);
			newLine.select(".y.axis")
				.duration(500)
				.call(yAxis);	
		};

		gChart.append('rect')
			.attr('class', 'overlay')
			.attr('width', chartWidth)
			.attr('height', chartHeight)
			.on('mouseover', function() { focus.style('display', null); })
			.on('mouseout', function() { focus.style('display', 'none'); })
			.on('mousemove', function() { 
				var mouse = d3.mouse(this);
				var mouseDate = x.invert(mouse[0]);
				var i = bisectDate(lineData, mouseDate);
								
				var d0 = lineData[i - 1]
				var d1 = lineData[i];
								
				var d = mouseDate - d0[0] > d1[0] - mouseDate ? d1 : d0;

				var crossX = x(d.date);
				var crossY = y(d.stats);
								
				var textX = crossX - focus.select("#focusTextX").node().getComputedTextLength();

				focus.select('#focusCircle')
					.attr('cx', crossX)
					.attr('cy', crossY)
					.attr("stroke", lineColor)
					.attr("fill", lineColor);
				focus.select('#focusLineX')
					.attr('x1', crossX).attr('y1', y(yDomainMin))
					.attr('x2', crossX).attr('y2', y(yDomainMax));
				focus.select('#focusLineY')
					.attr('x1', 0).attr('y1', crossY)
					.attr('x2', 750).attr('y2', crossY);
				focus.select("#focusTextY")
					.attr("transform", "translate(" + 0 + "," + (crossY - 10) + ")")
					.text(function() {
						if (radioStatus == 0) {
							return (d.stats + " °C");
						}
						
						if (radioStatus == 1) {
							return (d.stats + " J/cm2");
						}						
					});						
				focus.select("#focusTextX")
					.attr("transform", "translate(" + (textX + 45) + "," + (y(yDomainMax) - 15) + ")")
					.text(d.date.toString()
							.replace('0100', '0200')
							.replace('standaardtijd', 'zomertijd')
							.replace('00:00:00 GMT+0200 (West-Europa (zomertijd))', ''));
			});
	}	
			
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
	}
	
	var houseScore = 0; 
	
	function processBar(houseScore) {
		var wrapper = document.getElementById('progress');
		var start = 0;
		var end = houseScore;

		var colours = {
			fill: function() {
				if (end <= 50) {
					return 'rgb(' + 255 + ',' + Math.round(5.1 * end) + ',' + 0 + ')'
				}
				
				else {
					return 'rgb(' + (255 - Math.round(5.1 * (end - 50))) + ',' + 255 + ',' + 0 + ')'
				}
			},
			track: '#' + wrapper.dataset.trackColour,
			text: '#' + wrapper.dataset.textColour,
			stroke: '#' + wrapper.dataset.strokeColour,
		}

		var progressRadius = 100;
		var border = wrapper.dataset.trackWidth;
		var strokeSpacing = wrapper.dataset.strokeSpacing;
		var endAngle = Math.PI * 2;
		var formatText = d3.format('.0%');
		var boxSize = radius * 2;
		var count = end;
		var progress = start;
		var step = end < start ? -0.01 : 0.01;

		//Define the circle
		var circle = d3.svg.arc()
			.startAngle(0)
			.innerRadius(progressRadius)
			.outerRadius(progressRadius - border);

		//setup SVG wrapper
		var svg = d3.select(wrapper)
			.append('svg')
			.attr("class", "progress_svg")
			.attr('width', boxSize)
			.attr('height', boxSize)
			.attr('transform', 'translate(' + 20 + ',' + 20 + ')');

		// add group container
		var g = svg.append('g')
			.attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

		// setup track
		var track = g.append('g').attr('class', 'radial-progress');
		track.append('path')
			.attr('class', 'radial-progress__background')
			.attr('fill', colours.track)
			.attr('stroke', colours.stroke)
			.attr('stroke-width', strokeSpacing + 'px')
			.attr('d', circle.endAngle(endAngle));

		// add colour fill
		var value = track.append('path')
			.attr('class', 'radial-progress__value')
			.attr('fill', colours.fill)
			.attr('stroke', colours.stroke)
			.attr('stroke-width', strokeSpacing + 'px');

		function update(progress) {
			//update position of endAngle
			value.attr('d', circle.endAngle(endAngle * progress));
		} 

		(function iterate() {
			// call update to begin animation
			update(progress);
			if (count > 0) {
				// reduce count until it reaches 0
				count--;
				// increase progress
				progress += step;
				// control the speed of the fill
				setTimeout(iterate, 10);
			}
		})();
	}
		
	// instantiate variables for calculations
	var orientation = "";
	var angle = "";
	var surface = 0;
	var panel = 0;
	var coefficient = 0;
	var cost = 0;
	var usage = 0;
	var orientationScore = 0;
	var angleScore = 0;
	var surfaceScore = 0;
	var panelScore = 0;
	var usageScore = 0;
		
	// placeholder variables for testing
	var calTemp = 0;
	var calRad = 0;
	
	// instantiate other calculation variables
	var capacity = 0;
	var inverterEfficiency = 0.95;
	var insolation = 0;
	var reference = 25;
	var temperatureFactor = 0;
	
	// cost per kWh
	var energy = 0.20;
	
	// size of one panel in square meters
	var size = 1.65
	
	function calFactors(monthValue, station) {
		totalTemp = 0;
		totalRad = 0;
		
		if (monthValue != "") {
			if (monthValue == "Jaar") {
				for (var i = 0; i < ((months.length) - 1); i++) {
					for (var j = 0; j < data[station].dates[months[i]].length; j++) {
						totalTemp += data[station].dates[months[i]][j].temperature;
						totalRad += data[station].dates[months[i]][j].radiation;
					}
				}
				
				calTemp = totalTemp/365;
				calRad = totalRad/365;				
			} 
			
			else {
				for (var i = 0; i < data[station].dates[monthValue].length; i++) {
					totalTemp += data[station].dates[monthValue][i].temperature
					totalRad += data[station].dates[monthValue][i].radiation
				}
				
				calTemp = totalTemp/(data[station].dates[monthValue].length);
				calRad = totalRad/(data[station].dates[monthValue].length);
			}
		}
	}			
	
	// calculation function
	function calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad) {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0 && calTemp != 0 && calRad != 0) {
			
			houseScore = ((orientationScore + angleScore + surfaceScore + panelScore + usageScore)/5)*100; 
									
			radarData = [
				[
					{axis: "Oriëntatie", value: orientationScore},
					{axis: "Dakhoek", value: angleScore},
					{axis: "Dakoppervlak", value: surfaceScore},
					{axis: "Rendement", value: panelScore},
					{axis: "Verbruik", value: usageScore},								
				]
			];
						
			d3.select("#radar").select(".radarWrapper").remove();
			d3.select("#radar").select(".radarCircleWrapper").remove();
			d3.select("#radar").select(".tooltip").remove();
							
			updateRadar(radarData, cfg);
									
			insolationEfficiency = percentages[orientation]["angle"][angle];
									
			idealInsolation = (calRad*10000)/3600000;
			
			trueInsolation = idealInsolation*insolationEfficiency;
			
			capacity = surface*panel*inverterEfficiency;
			
			basicOutput = trueInsolation*capacity;
						
			productionDay = basicOutput*(1-(((calTemp - 25)*coefficient))/100);
			productionYear = productionDay*365;
			
			totalCost = (surface/size)*cost;
									
			profit = productionYear*energy;
			
			payback = totalCost/profit;
						
			// update result div values when a new calculation is made
			$(".results > .production").text(parseInt(productionYear));
			$(".results > .profit").text(parseInt(profit));
			$(".results > .payback").text(parseInt(payback));
			
			d3.select("#progress").select(".radial-progress").remove();
			d3.select("#progress").select("svg").remove();
			processBar(houseScore);
		}
	};
	
	// when a location is selected, display it in the button and store its value in a variable for calculation
	$("a[class=location-a]").on("click", function(){
		station = $(this).attr("data-location");
		
		// when a new weather station is selected, display its name in the text box
		$("button.button-width-location").text($(this).text());	
		
		// highlight the selected weather station dot and make all other dots red
		svgNL.selectAll("circle")
			.style("fill","red")
			.attr("r", 8);
		d3.select("#name" + station)
			.style("fill", "#FFB6C1")
			.attr("r", 8);
		
		updateLine(station, monthValue, radioStatus);
		
		calFactors(monthValue, station);
						
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
	});
	
	// when an orientation is selected, display it in the button and store its value in a variable for calculation
	$("a[class=orientation-a]").on("click", function(){
		orientation = $(this).attr("data-orientation");
		orientationScore = parseFloat($(this).attr("orientation-score"));
		$("button.button-width-orientation").text($(this).text());	
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);		
	});
	
	// when an angle is selected, display it in the button and store its value in a variable for calculation
	$("a[class=angle-a]").on("click", function(){
		angle = $(this).attr("data-angle");
		angleScore = parseFloat($(this).attr("angle-score"));
		$("button.button-width-angle").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
	});
	
	// when a surface is selected, display it in the button and store its value in a variable for calculation
	$("a[class=surface-a]").on("click", function(){
		surface = parseInt($(this).attr("data-surface"));
		surfaceScore = parseFloat($(this).attr("surface-score"));
		$("button.button-width-surface").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
	});
	
	// when a panel is selected, display it in the button and store its value in a variable for calculation
	$("a[class=panel-a]").on("click", function(){
		panel = parseFloat($(this).attr("data-panel"));
		panelScore = parseFloat($(this).attr("panel-score"));
		$("button.button-width-panel").text($(this).text());
		coefficient = parseFloat($(this).attr("data-coefficient"));
		cost = parseInt($(this).attr("data-price"));
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);		
	});
	
	// when a usage is selected, display it in the button and store its value in a variable for calculation
	$("a[class=usage-a]").on("click", function(){
		usage = parseInt($(this).attr("data-usage"));
		usageScore = parseFloat($(this).attr("usage-score"));
		$("button.button-width-usage").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
	});
	
	/*
	var l = topojson.feature(nld, nld.objects.subunits).features[3],
		b = path.bounds(l),
		s = .3 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
		t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
	
	console.log(s, t);
	*/
	
	// map scale and position
	projection
		.scale(5000)
		.translate([-250, 5580]);

	// draw the map
	svgNL.selectAll("path")
		.data(topojson.feature(nld, nld.objects.subunits).features).enter()
		.append("path")
		.attr("d", path)
		.attr("fill", "#ffaa55")
		.attr("class", function(d, i) {
			return d.properties.name;
		});
	
	// make an array with parts of the json data to determine placement of the dots on the map
	dots = [];	
	Object.keys(data).forEach(function(key,index) {
		dot = [data[key].lon, data[key].lat, key];
		dots.push(dot);
	});
				
	// add circles to svg
    svgNL.selectAll("circle")
		.data(dots).enter()
		.append("circle")
		.attr("id", function(d){ return "name" + d[2]; })
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")
		.on("click", function (d) { 
			station = d[2];
			updateLine(station, monthValue, radioStatus);
						
			// display the name of the clicked station in the button
			$("button.button-width-location").text(d[2]);
									
			// highlight the clicked dot and make all other dots red
			svgNL.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
			
			calFactors(monthValue, station);
			calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
		});
		
	function chartPlot(station, value) {
		monthValue = value;
		
		updateLine(station, monthValue, radioStatus);
	};	
		
	/* 
		add a slider to select which month the weather station data should be
		picked from. Sliding it will re-check weather the station has been changed
		and if so, loads the month data from the new station.
	*/
	slider = d3.slider()
		.scale(d3.scale.ordinal()
		.domain(months)
		.rangePoints([0, 1], 0.5))
		.axis(d3.svg.axis())
		.snap(true)
		.value("Jaar")
		.on("slide", function(evt, value) {
			chartPlot(station, value)
			
			calFactors(value, station);
			
			calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad)
		});
	   
	// call the slider to display it on the page
	d3.select("#slider").call(slider);		
};
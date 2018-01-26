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
	- https://bl.ocks.org/mbostock/3887235
	- http://bl.ocks.org/d3noob/e34791a32a54e015f57d
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
	- https://woonbewust.nl/blog/soorten-zonnepanelen
	- https://www.zonne-paneel.net/prijs-zonnepanelen/
	- http://www.sun-solar.nl/index.php/product/solar-frontier-sf175-s-paneel-135-euro-incl-btw-sunsolar/
	- https://www.essent.nl/content/particulier/kennisbank/zonnepanelen/opbrengst-zonnepanelen-per-maand.html#
*/

// activate popover functionality for information tab
$(document).ready(function(){
    $('[data-toggle="popover"]').popover(); 
});

// instantiate global variables
var monthValue = "Jaar";
var station = "";
var monthTotalTemp = 0;
var monthTotalRad = 0;

// array of month abbreviations to check which array within a station object to load data from
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jaar"];	

// instantiate global chart domain names
var yDomainMin;
var yDomainMinTwo;
var yDomainMax;
var yDomainMaxTwo;
var xDomainMin;
var xDomainMax;

// variables to keep track of checkbox statuses
var tempActive = 1;
var radActive = 1;
$('#check-temperature').prop('checked', true);
$('#check-radiation').prop('checked', true);

// blank radar chart data
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

// define date format
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

// select svg element to put the line chart into	
var svgChart = 	d3.select("#chart")
	chartMargin = {top: 30, right: 20, bottom: 10, left: 50},
	chartWidth = 850 - chartMargin.left - chartMargin.right,
	chartHeight = 240 - chartMargin.top - chartMargin.bottom,
    gChart = svgChart.append("g").attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
	
// select svg element to put the radar chart into
var svgRadar = d3.select("#radar")
	radarMargin = {top: 70, right: 70, bottom: 80, left: 80},
	radarWidth = 550 - radarMargin.left - radarMargin.right,
	radarHeight = 550 - radarMargin.top - radarMargin.bottom,
	gRadar = svgRadar.append("g").attr("transform", "translate(" + (radarWidth/2 + radarMargin.left) + "," + (radarHeight/2 + radarMargin.top) + ")");	

// select svg element to put the pie chart into
var svgPie = d3.select("#pie"),
	pieWidth = 250,
	pieHeight = 250,
	radius = Math.min(pieWidth, pieHeight) / 2,
	gPie = svgPie.append("g").attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");
	
// declare pie chart basis	
var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; });

// pie chart parameters		
var piePath = d3.svg.arc()
	.outerRadius(radius - 10)
	.innerRadius(0);

// pie chart category label positions	
var pieLabel = d3.svg.arc()	
	.outerRadius(radius - 40)
	.innerRadius(radius - 40);

// define tooltip that shows the value at each pie chart slice
var pieTip = d3.tip()
	.attr("class", "tip")
	.offset([40, 0])
	.html(function(d) {
		return "<strong>Bijdrage:<strong> <span>" + parseInt(d.value*100) + "%</span>";
	});

// define tooltip that shows the value of every radar chart category
var radarTip = d3.tip()
	.attr("class", "tip")
	.offset([-12, 0])
	.html(function(d) {
		return "<strong>Score:<strong> <span>" + parseInt(d.value*10) + "</span>";
	});

// define tooltip that shows the name of every weather station on the map
var mapTip = d3.tip()
	.attr("class", "tip")
	.offset([-12, 0])
	.html(function(d) {
		return "<span>" + d[2] + "</span>";
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

function updateRadar(radarData, cfg) {
	// if the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));

	var allAxis = (radarData[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
			
	// scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	// the radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });	
	
	// create a wrapper for the blobs	
	var blobWrapper = gRadar.selectAll(".radarWrapper")
		.data(radarData)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	// colored backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", "orange")
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			// dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			// bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			// bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	// create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", "orange")
		.style("fill", "none")
			
	// append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "orange")
		.style("fill-opacity", 0.8);

	// wrapper for the invisible circles on top
	var blobCircleWrapper = gRadar.selectAll(".radarCircleWrapper")
		.data(radarData)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	// append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on('mouseover', radarTip.show)
		.on('mouseout', radarTip.hide);
	
	// call the radar chart tooltip functionality
	svgRadar.call(radarTip);	
};

// instantiate line chart main domains		
var xDomain;
var yDomain;	
var yDomainTwo;	

// line chart x axis	
var x = d3.time.scale()
	.rangeRound([0, chartWidth])

// line chart temperature axis	
var y = d3.scale.linear()
	.rangeRound([chartHeight, 0])

// line	chart radiation axis
var yTwo = d3.scale.linear()
	.rangeRound([chartHeight, 0])

// temperature line variable	
var tempLine = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.temperature); });

// radiation line variable
var radLine = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return yTwo(d.radiation); });
	
// line chart x axis properties		
var	xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
	
// line chart y axis properties	
var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");
	
// line chart y axis properties	
var yAxisTwo = d3.svg.axis()
	.scale(yTwo)
	.orient("right");		
		
// queue weather station data and map data
d3.queue()
	.defer(d3.json, "datasets/data.json")
	.defer(d3.json, "datasets/map.json")
	.defer(d3.json, "datasets/percentages.json")
	.await(ready);
	
function ready(error, data, nld, percentages) {
	/*
		put all data into the appropriate format.
		Dates to date formats, temperature and 
		radiation to numbers.
	*/
	Object.keys(data).forEach(function(key,index) {
		Object.keys(data[key].dates).forEach(function(part,index) {
			data[key].dates[part].forEach(function(d) {
				d.date = format(d.date);
				d.temperature = +d.temperature;
				d.radiation = +d.radiation;
			});			
		})
	});
	
	// log data to check for errors
	console.log(data);
	console.log(percentages);

	// instantiate data array for the line chart values
	lineData = []
	
	// add the a axis
	gChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + chartHeight + ")")
		.call(xAxis)
		.select(".domain")
			.remove();
	
	// add the temperature axis
	gChart.append("g")
		.attr("class", "y axis")
		.style("fill", "red")
		.style("stroke", "red")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", -28)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Temperatuur");
	
	// add the radiation axis
	gChart.append("g")
		.attr("class", "y axisTwo")
		.attr("transform", "translate(" + chartWidth + " ,0)")	
		.style("fill", "yellow")
		.style("stroke", "yellow")
		.call(yAxisTwo)
		.append("text")
		.attr("class", "label")
		.attr("x", -20)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Straling");
	
	// add the temperature line
	gChart.append("path")
		.attr("class", "tempLines")
		.attr("id", "tempLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "red")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", tempLine);
	
	// add the radiation line
	gChart.append("path")
		.attr("class", "radLines")
		.attr("id", "radLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "yellow")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", radLine);
	
	// define variable to serve as the basis for the crosshair functionality
	var focus = gChart.append('g')
		.style('display', 'none');
    
	/*
		define all visible crosshair parts
	*/
	focus.append('line')
		.attr('id', 'focusLineX')
		.attr('class', 'focusLine');
	focus.append('line')
		.attr('id', 'focusLineY')
		.attr('class', 'focusLine');
	focus.append('line')
		.attr('id', 'focusLineYTwo')
		.attr('class', 'focusLine');
	focus.append('circle')
		.attr('id', 'focusCircle')
		.attr('r', 5)
		.attr('class', 'circle focusCircle');
	focus.append('circle')
		.attr('id', 'focusCircleTwo')
		.attr('r', 5)
		.attr('class', 'circle focusCircle');
	focus.append('text')	
		.attr('id', 'focusTextX')
		.attr("x", 9)
		.attr("dy", ".35em");
	focus.append('text')	
		.attr('id', 'focusTextXTwo')
		.attr("x", 9)
		.attr("dy", ".35em");
	focus.append('text')	
		.attr('id', 'focusTextY')
		.attr("x", 9)
		.attr("dy", ".35em");	
	focus.append('text')	
		.attr('id', 'focusTextYTwo')
		.attr("x", 9)
		.attr("dy", ".35em");	
		
	var bisectDate = d3.bisector(function(d) { return d.date; }).left;
	
	// temperature line turns on or of depending on whether its checkbox is checked or not
	$(".check-temperature").on("click", function() {
		var tempActive = tempLine.active ? false : true;
		
		newTempOpacity = tempActive ? 0 : 1;
		
		d3.select("#tempLine").style("opacity", newTempOpacity);
		
		tempLine.active = tempActive;
					
	})
	
	// radiation line turns on or of depending on whether its checkbox is checked or not
	$(".check-radiation").on("click", function() {
		var radActive = radLine.active ? false : true;
		
		newRadOpacity = radActive ? 0 : 1;
		
		d3.select("#radLine").style("opacity", newRadOpacity);
		
		radLine.active = radActive;	
	})
	
	// function to update the lines and axes when a new month or station is selected
	function updateLine(station, monthValue) {
		
		// if the whole year is selected, select data from all months to average from
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
		
		// define variable to make changes to the line chart with
		var newLine = d3.select("#chart").transition();
					
		// define temperature domains		
		xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
		yDomain = y.domain(d3.extent(lineData, function(d) { return d.temperature; }));
					
		xDomainMin = 0;
		xDomainMax = lineData.length;
		
		yDomainMin = d3.min(lineData, function(d) { return d.temperature; });
		yDomainMax = d3.max(lineData, function(d) { return d.temperature; });
		
		// apply the new line data and domain values to the corresponding parts
		newLine.select(".tempLines")
			.duration(500)
			.attr("d", tempLine(lineData))
			.attr("fill", "none");
		newLine.select(".x.axis")
			.duration(500)
			.call(xAxis);
		newLine.select(".y.axis")
			.duration(500)
			.call(yAxis);
		
		// define radiation domains
		xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
		yDomainTwo = yTwo.domain(d3.extent(lineData, function(d) { return d.radiation; }));
	
		xDomainMin = 0;
		xDomainMax = lineData.length;
	
		yDomainMinTwo = d3.min(lineData, function(d) { return d.radiation; });
		yDomainMaxTwo = d3.max(lineData, function(d) { return d.radiation; });
		
		// apply the new line data and domain values to the corresponding parts
		newLine.select(".radLines")
			.duration(500)
			.attr("d", radLine(lineData))
			.attr("fill", "none");
		newLine.select(".x.axis")
			.duration(500)
			.call(xAxis);
		newLine.select(".y.axisTwo")
			.duration(500)
			.call(yAxisTwo);	
		
		// add an invisible chart sizes rectangle to track mouse position for crosshairs
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
				
				if (i != 0) {
					var d0 = lineData[i - 1]
					var d1 = lineData[i];
									
					var d = mouseDate - d0[0] > d1[0] - mouseDate ? d1 : d0;

					var crossX = x(d.date);
					var crossY = y(d.temperature);
					var crossYTwo = yTwo(d.radiation);
									
					var textX = crossX - focus.select("#focusTextX").node().getComputedTextLength();

					/*
						add all crosshair parts which follow the cursor around
					*/
					focus.select('#focusCircle')
						.attr('cx', crossX)
						.attr('cy', crossY)
						.attr("stroke", "red")
						.attr("fill", "red");
					focus.select('#focusCircleTwo')
						.attr('cx', crossX)
						.attr('cy', crossYTwo)
						.attr("stroke", "yellow")
						.attr("fill", "yellow");
					focus.select('#focusLineX')
						.attr('x1', crossX).attr('y1', y(yDomainMin))
						.attr('x2', crossX).attr('y2', y(yDomainMax));
					focus.select('#focusLineY')
						.attr('x1', 0).attr('y1', crossY)
						.attr('x2', 750).attr('y2', crossY);
					focus.select('#focusLineYTwo')
						.attr('x1', 0).attr('y1', crossYTwo)
						.attr('x2', 750).attr('y2', crossYTwo);
					focus.select("#focusTextY")
						.attr("transform", "translate(" + 0 + "," + (crossY - 10) + ")")
						.text(function() {
							if (tempActive == true) {
								return (d.temperature + " °C");
							}
						});
					focus.select("#focusTextYTwo")
						.attr("transform", "translate(" + 0 + "," + (crossYTwo - 10) + ")")
						.text(function() {
							if (radActive == true) {
								return (d.radiation + " J/cm2");
							};						
						});						
					focus.select("#focusTextX")
						.attr("transform", "translate(" + (textX + 45) + "," + (y(yDomainMax) - 15) + ")")
						.text(d.date.toString()
								.replace('0100', '0200')
								.replace('standaardtijd', 'zomertijd')
								.replace('00:00:00 GMT+0200 (West-Europa (zomertijd))', ''));
					focus.select("#focusTextXTwo")
						.attr("transform", "translate(" + (textX + 110) + "," + (y(yDomainMax) + 15) + ")")
						.text(function() {
							return (lineCalculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, d.temperature, d.radiation)[0]
									+ " kWh	" + lineCalculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, d.temperature, d.radiation)[1] + " euro");
						});
				};
			});
	}	
			
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
	}
	
	// instantiate total house score variable
	var houseScore = 0; 
	
	// draw a radial progress bar showing the total score of the house
	function processBar(houseScore) {
		var wrapper = document.getElementById('progress');
		var start = 0;
		var end = houseScore;
		
		// define tooltip that shows the score on hover
		var scoreTip = d3.tip()
			.attr("class", "tip")
			.offset([-5, 0])
			.html(function(d) {
				return "<strong>Overall score: </strong> <span>" + parseFloat(houseScore/10) + "</span>";
			});
		
		// make bar color scale with the score (higher = greener, lower = redder, yellow towards the middle)
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
		
		/*
			radial progress bar parameter values
		*/
		var progressRadius = 140;
		var border = wrapper.dataset.trackWidth;
		var strokeSpacing = wrapper.dataset.strokeSpacing;
		var endAngle = Math.PI * 2;
		var formatText = d3.format('.0%');
		var boxSize = radius * 2;
		var count = end;
		var progress = start;
		var step = end < start ? -0.01 : 0.01;

		// define the circle
		var circle = d3.svg.arc()
			.startAngle(0)
			.innerRadius(progressRadius)
			.outerRadius(progressRadius - border);

		// setup SVG wrapper
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
			.attr('stroke-width', strokeSpacing + 'px')
			.on('mouseover', scoreTip.show)
			.on('mouseout', scoreTip.hide);
			
		function update(progress) {
			// update position of endAngle
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
		
		// call the tooltip to display the house score on hover
		svg.call(scoreTip);
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
		
	var pieColor = "";
	
	// general monthly shares of total yearly energy production
	var monthFactors = 	[
							{"month": "Jan", "value": 0.03, "color": pieColor},
							{"month": "Feb", "value": 0.05, "color": pieColor},
							{"month": "Mar", "value": 0.08, "color": pieColor},
							{"month": "Apr", "value": 0.12, "color": pieColor},
							{"month": "May", "value": 0.13, "color": pieColor},
							{"month": "Jun", "value": 0.13, "color": pieColor},
							{"month": "Jul", "value": 0.13, "color": pieColor},
							{"month": "Aug", "value": 0.13, "color": pieColor},
							{"month": "Sep", "value": 0.11, "color": pieColor},
							{"month": "Oct", "value": 0.10, "color": pieColor},
							{"month": "Nov", "value": 0.07, "color": pieColor},
							{"month": "Dec", "value": 0.02, "color": pieColor},
						]
	
	/*	
		make a pie chart showing how much each month contributes to yearly energy production 					
	*/
	function pieChart(pieData, piePath) {
		pieData.forEach(function(d) {
			d.value = +d.value;
			
			// the higher the month contribution value, the more orange its slice is 
			d.color = "rgb(255," + parseInt(245 - (92 * ((d.value - 0.02)/0.11))) + "," + parseInt(230 - (230 * ((d.value - 0.02)/0.11))) + ")";	
		});
		
		var arc = gPie.selectAll(".arc")
			.data(pie(pieData))
			.enter().append("g")
			.attr("class", "arc");

		arc.append("path")
			.attr("d", piePath)
			.attr("fill", function(d) { return d.data["color"]; })
			.attr("id", function(d) { return "pieName" + d.data["month"] ;})
			.on("click", function(d) {
				monthValue = d.data["month"];
				
				// when a particular month is selected from the pie chart, change the slider position and thereby all visualization data and results
				slider.value(monthValue);
				
				gPie.selectAll("path")
					.style("fill", "#ffffcc")
				d3.select(this)
					.style("fill", "orange")
			})
			.on('mouseover', pieTip.show)
			.on('mouseout', pieTip.hide);

		arc.append("text")
			.attr("transform", function(d) { return "translate(" + pieLabel.centroid(d) + ")"; })
			.attr("dy", "0.35em")
			.text(function(d) { return d.data["month"]; });
	};	
	
	/*
		determine monthly or yearly average temperature and radiation for calculation input
	*/
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
	
	/* 
		results calculation function
	*/
	function calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad) {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0 && calTemp != 0 && calRad != 0) {
			
			houseScore = ((orientationScore + angleScore + surfaceScore + panelScore + usageScore)/5)*100; 
			
			// update radar chart data based on user inputs
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
			
			// update radar chart
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
			
			// update radial progress bar to reflect any changes in user input
			processBar(houseScore);
		}
	};
	
	// calculation function for the daily production and profit values to be displayed along the crosshair on the line chart
	function lineCalculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad) {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0 && calTemp != 0 && calRad != 0) {
			
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
						
			var returnArray = [Math.round(productionDay * 100) / 100, Math.round(profit * 10) / 10]
			
			return returnArray;
		}
	};
	
	// draw the pie chart along with tooltip functionality
	pieChart(monthFactors, piePath);
	svgPie.call(pieTip);
	
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
		
		// update line chart and recalculate results
		updateLine(station, monthValue);		
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
	
	// when a panel is selected, display it in the button and store its values in a variable for calculation
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
				
	// add circles to map svg
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
			
			// update line chart to display current weather station data
			updateLine(station, monthValue);		
						
			// display the name of the clicked station in the button
			$("button.button-width-location").text(d[2]);
									
			// highlight the clicked dot and make all other dots red
			svgNL.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
			
			// recalculate results
			calFactors(monthValue, station);
			calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad);
		})
		.on('mouseover', mapTip.show)
		.on('mouseout', mapTip.hide);
	
	// call map tooltip functionality
	svgNL.call(mapTip);	
		
	function chartPlot(station, value) {
		monthValue = value;
		
		updateLine(station, monthValue);		
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
		.value(monthValue)
		.on("slide", function(evt, value) {
			
			gPie.selectAll("path")
				.style("fill", "#ffffcc")
			d3.select("#pieName" + value)
				.style("fill", "orange")
			
			chartPlot(station, value)
			
			calFactors(value, station);
			
			calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore, calTemp, calRad)
		});
	   
	// call the slider to display it on the page
	d3.select("#slider").call(slider);		
};
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

$(document).ready(function () {
	$('.pop').each(function () {
		var $elem = $(this);
		$elem.popover({
			placement: 'right',
			trigger: 'hover',
			html: true,
			container: $elem,
			animation: true
		});
	});		
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
	gPie = svgPie.append("g").attr("transform", "translate(" + (pieWidth / 2 + 15) + "," + (pieHeight / 2 + 15) + ")");
	
// declare pie chart basis	
var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; });

// pie chart parameters		
var piePath = d3.svg.arc()
	.outerRadius(radius - 10)
	.innerRadius(0);
	
var labelArc = d3.svg.arc()
	.outerRadius(radius - 45)
	.innerRadius(radius - 45);	

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
	.tickFormat(d3.time.format("%b"))
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
	.defer(d3.json, "datasets/months.json")
	.await(ready);
	
function ready(error, data, nld, percentages, monthEfficiency) {
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
		.style("fill", "#cc0000")
		.style("stroke", "#cc0000")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", -29)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Temperatuur(°C)");
	
	// add the radiation axis
	gChart.append("g")
		.attr("class", "y axisTwo")
		.attr("transform", "translate(" + chartWidth + " ,0)")	
		.style("fill", "#ffcc00")
		.style("stroke", "#ffcc00")
		.call(yAxisTwo)
		.append("text")
		.attr("class", "label")
		.attr("x", -64)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Straling(J/cm2)");
	
	// add the temperature line
	gChart.append("path")
		.attr("class", "tempLines")
		.attr("id", "tempLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "#cc0000")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 2)
		.attr("d", tempLine);
	
	// add the radiation line
	gChart.append("path")
		.attr("class", "radLines")
		.attr("id", "radLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "#ffcc00")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 2)
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
		if (monthValue == "Jaar") {
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis.tickFormat(d3.time.format("%b")));
		}
		else {
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis.tickFormat(d3.time.format("%d")));	
		}				
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
		if (monthValue == "Jaar") {
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis.tickFormat(d3.time.format("%b")));
		}
		else {
			newLine.select(".x.axis")
				.duration(500)
				.call(xAxis.tickFormat(d3.time.format("%d")));
		}				
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
						.attr("stroke", "#cc0000")
						.attr("fill", "#cc0000");
					focus.select('#focusCircleTwo')
						.attr('cx', crossX)
						.attr('cy', crossYTwo)
						.attr("stroke", "#ffcc00")
						.attr("fill", "#ffcc00");
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
							if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0) {
								return (Math.round(dailyResults(d.temperature, d.radiation)[0]) + " kWh	" + Math.round(dailyResults(d.temperature, d.radiation)[1]) + " euro");
							}
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
			track: "#ffffff",
			text: "00c0ff",
			stroke: "ffffff",
		}
		
		/*
			radial progress bar parameter values
		*/
		var progressRadius = 140;
		var border = 20;
		var strokeSpacing = 0;
		var endAngle = Math.PI * 2;
		var formatText = d3.format('.0%');
		var boxSize = progressRadius * 2;
		var count = end;
		var progress = start;
		var step = end < start ? -0.01 : 0.01;

		// define the circle
		var circle = d3.svg.arc()
			.startAngle(0)
			.innerRadius(progressRadius)
			.outerRadius(progressRadius - border);

		// setup SVG wrapper
		var svg = d3.select("#pie")
			.append('svg')
			.attr("class", "progress_svg")
			.attr('width', boxSize)
			.attr('height', boxSize);

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
	var calYearTemp = 0;
	var calYearRad = 0;
	var dailyTemp = 0;
	var dailyRad = 0;
	
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
	function pieColors(pieData, piePath) {
		var least = 1;
		var most = 0;
		
		pieData.forEach(function(d) {
			d.value = +d.value;
						
			if (d.value < least) {
				least = d["value"];
			};
			if (d.value > most) {
				most = d["value"];
			};
		});	
		
		pieData.forEach(function(d) {
			// the higher the month contribution value, the more orange its slice is 
			d.color = "rgb(255," + parseInt(245 - (92 * ((d.value - least)/(most - least)))) + "," + parseInt(230 - (230 * ((d.value - least)/(most - least)))) + ")";	
		});
	};
	
	pieColors(monthFactors, piePath);
		
	var arc = gPie
		.datum(monthFactors)
		.selectAll("path")
		.data(pie)
		.enter()
		.append("path")
		.attr("d", piePath)
		.attr("stroke", "white")
		.attr("fill", function(d) { return d.data["color"]; })
		.attr("id", function(d) { return "pieName" + d.data["month"] ;})
		.each(function(d) {
			this._current = d;			
		})
		.on("click", function(d) {
			monthValue = d.data["month"];
			
			// when a particular month is selected from the pie chart, change the slider position and thereby all visualization data and results
			slider.value(monthValue);
			
			if (monthValue == "Jaar") {
				updatePie(monthFactors);
			}
			else {
				gPie.selectAll("path")
					.style("fill", "#ffffcc")
				d3.select(this)
					.style("fill", "orange")
			};
		})
		.on('mouseover', pieTip.show)
		.on('mouseout', pieTip.hide);
	
	gPie.append("g")
		.attr("class", "labelText");
	
	var pieText = gPie.select(".labelText").selectAll("text")
		.data(pie(monthFactors), function(d) {
			return d.data["month"]
		})
		.enter()
		.append("text")	
		.attr("transform", function(d) { 
			var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
			return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
		.attr("dy", "0.35em")
		.attr("font-size", "15px")
		.attr('text-anchor','middle')
		.text(function(d) { return d.data["month"]; })
		.each(function(d) {
			this._current = d;			
		});
		
	function updatePie(newPieData) {
		arc = arc.data(pie(newPieData));
		arc.transition()
			.duration(500)
			.attrTween("d", arcTween);
		gPie.select(".labelText").remove();	
		gPie.append("g")
		.attr("class", "labelText");
	
		var pieText = gPie.select(".labelText").selectAll("text")
			.data(pie(monthFactors), function(d) {
				return d.data["month"]
			})
			.enter()
			.append("text")	
			.attr("transform", function(d) { 
				var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
				return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
			.attr("dy", "0.35em")
			.attr("font-size", "15px")
			.attr('text-anchor','middle')
			.text(function(d) { return d.data["month"]; })
			.each(function(d) {
				this._current = d;			
			});
	};
		
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return piePath(i(t));
		};
	}			
			
	function dailyResults(dailyTemp, dailyRad) {
		idealInsolation = (dailyRad*10000)/3600000;
		insolationEfficiency = percentages[orientation]["angle"][angle];
		//insolationMonthEfficiency = monthEfficiency[monthValue]["angle"][angle];
		trueInsolation = idealInsolation*insolationEfficiency//*insolationEfficiency;
		basicOutput = trueInsolation*capacity;
		productionDay = basicOutput*(1-(((dailyTemp - 25)*coefficient))/100);
		profitDay = productionDay*energy;
		
		var dailyArray = [productionDay, profitDay]
		
		return dailyArray;
	}
	
	/*
		determine monthly or yearly average temperature and radiation for calculation input
	*/
	function periodResults(monthValue, station) {
		var yearProduction = 0;
		var yearProfit = 0;
		var monthProduction = 0;
		var monthProfit = 0;
				
		if (monthValue != "") {			
			for (var i = 0; i < ((months.length) - 1); i++) {
				var tempProduction = 0;
								
				for (var j = 0; j < data[station].dates[months[i]].length; j++) {
					yearProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation)[0];
					yearProfit += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation)[1];
					tempProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation)[0];
				}
				
				monthFactors[i]["value"] = tempProduction;
			}
			
			var periodArray = [yearProduction, yearProfit]
									
			if (monthValue != "Jaar") {
				for (var i = 0; i < data[station].dates[monthValue].length; i++) {
					monthProduction += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation)[0];
					monthProfit += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation)[1];
				}
				
				periodArray.push(monthProduction);
				periodArray.push(monthProfit);
			}
						
			return periodArray;
		}
	}
	
	function scoreAngle() {
		if (monthValue == "Jaar") {
			var tempArray = Object.keys(percentages["zuid"]["angle"]).map(function ( key ) { return percentages["zuid"]["angle"][key]; });
			bestAngle = Math.max.apply( null, tempArray );
			worstAngle = Math.min.apply( null, tempArray );
			angleScore = ((percentages["zuid"]["angle"][angle]) - worstAngle)/(bestAngle - worstAngle);
		}
		else {
			var tempArray = Object.keys(monthEfficiency[monthValue]["angle"]).map(function ( key ) { return monthEfficiency[monthValue]["angle"][key]; });
			bestAngle = Math.max.apply( null, tempArray );
			worstAngle = Math.min.apply( null, tempArray );
			angleScore = ((monthEfficiency[monthValue]["angle"][angle]) - worstAngle)/(bestAngle - worstAngle);
		};
		return angleScore;
	}
	
	/* 
		results calculation function
	*/
	function calculation() {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0) {
			
			angleScore = scoreAngle();				
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
						
			capacity = surface*panel*inverterEfficiency;
			totalCost = (surface/size)*cost;
			
			productionYear = periodResults(monthValue, station)[0];
			profitYear = periodResults(monthValue, station)[1];
			productionMonth = periodResults(monthValue, station)[2];
			profitMonth = periodResults(monthValue, station)[3];
												
			payback = totalCost/profitYear;
			
			monthFactors.forEach(function(d) {
				d["value"] /= productionYear;				
			});
			pieColors(monthFactors, piePath);
			
			updatePie(monthFactors);
								
			// update result div values when a new calculation is made
			if (monthValue == "Jaar") {
				$(".results > .production").text(Math.round(parseFloat(productionYear)));
				$(".results > .profit").text(Math.round(parseFloat(profitYear)));
			}
			else {
				$(".results > .production").text(Math.round(parseFloat(productionMonth)));
				$(".results > .profit").text(Math.round(parseFloat(profitMonth)));
			};	
			$(".results > .payback").text(Math.round(parseFloat(payback)));
			
			d3.select("#progress").select(".radial-progress").remove();
			d3.select("#progress").select("svg").remove();
			
			// update radial progress bar to reflect any changes in user input
			processBar(houseScore);			
		}
	};
			
	// draw the pie chart along with tooltip functionality
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
		d3.select("#name" + station.replace(/ /g,''))
			.style("fill", "#FFB6C1")
			.attr("r", 8);
		
		// update line chart and recalculate results
		updateLine(station, monthValue);		
		calculation();
	});
	
	// when an orientation is selected, display it in the button and store its value in a variable for calculation
	$("a[class=orientation-a]").on("click", function(){
		orientation = $(this).attr("data-orientation");
		orientationScore = parseFloat($(this).attr("orientation-score"));
		$("button.button-width-orientation").text($(this).text());	
		calculation();		
	});
	
	// when an angle is selected, display it in the button and store its value in a variable for calculation
	$("a[class=angle-a]").on("click", function(){
		angle = $(this).attr("data-angle");
		$("button.button-width-angle").text($(this).text());
		calculation();
	});
	
	// when a surface is selected, display it in the button and store its value in a variable for calculation
	$("a[class=surface-a]").on("click", function(){
		surface = parseInt($(this).attr("data-surface"));
		surfaceScore = parseFloat($(this).attr("surface-score"));
		$("button.button-width-surface").text($(this).text());
		calculation();
	});
	
	// when a panel is selected, display it in the button and store its values in a variable for calculation
	$("a[class=panel-a]").on("click", function(){
		panel = parseFloat($(this).attr("data-panel"));
		panelScore = parseFloat($(this).attr("panel-score"));
		$("button.button-width-panel").text($(this).text());
		coefficient = parseFloat($(this).attr("data-coefficient"));
		cost = parseInt($(this).attr("data-price"));
		calculation();		
	});
	
	// when a usage is selected, display it in the button and store its value in a variable for calculation
	$("a[class=usage-a]").on("click", function(){
		usage = parseInt($(this).attr("data-usage"));
		usageScore = parseFloat($(this).attr("usage-score"));
		$("button.button-width-usage").text($(this).text());
		calculation();
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
		.attr("id", function(d){ return "name" + d[2].replace(/ /g,''); })
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
			calculation();
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
			
			monthValue = value;
			
			if (station != "") {
				updateLine(station, value);	
								
				calculation()
			}
		});
	   
	// call the slider to display it on the page
	d3.select("#slider").call(slider);		
};
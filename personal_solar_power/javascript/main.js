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
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
	- https://woonbewust.nl/blog/soorten-zonnepanelen
	- https://www.zonne-paneel.net/prijs-zonnepanelen/
	- http://www.sun-solar.nl/index.php/product/solar-frontier-sf175-s-paneel-135-euro-incl-btw-sunsolar/
*/

// radar specifications
RadarChart.defaultConfig.color = function() {};
RadarChart.defaultConfig.radius = 3;
RadarChart.defaultConfig.w = 600;
RadarChart.defaultConfig.h = 600;

// radarplot parameter data
var radarData = [
	{
		className: "house",
		axes: [
			{axis: "Oriëntatie", value: 0}, 
			{axis: "Verbruik", value: 0}, 
			{axis: "Rendement", value: 0},  
			{axis: "Dakoppervlak", value: 0},  
			{axis: "Dakhoek", value: 0.1}
		]
	}
];

var radar = RadarChart.chart();
var cfg = radar.config();

// define map size
var mapWidth = 450;
var mapHeight = 520;

// define chart size
var	chartMargin = {top: 10, right: 20, bottom: 30, left: 40},
	chartWidth = 800 - chartMargin.left - chartMargin.right,
	chartHeight = 190 - chartMargin.top - chartMargin.bottom;

//var format = d3.time.format("%Y-%b-%d");

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
var svgChart = 	d3.select("#chart").append("svg")
	.attr("width", chartWidth + chartMargin.left + chartMargin.right)
	.attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
	.append("g")
		.attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

// add an svg element to put the radar chart into		
var svgRadar = d3.select("#radar").append("svg")
	.attr("width", cfg.w + cfg.w + 50)
	.attr("height", cfg.h + cfg.h / 4);
	svgRadar.append("g").classed("single", 1).datum(radarData).call(radar);

// line chart x axis properties	
var x = d3.scale.linear()
	.range([0, chartWidth]);
	
// line chart y axis properties		
var y = d3.scale.linear()
	.range([chartHeight, 0]);

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
	console.log(data);
	console.log(percentages);
			
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
	}
	
	// instantiate variables for calculations
	var station = "";
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
	var radiation = 1000;
	var temperature = 100;
	
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
			
	// calculation function
	function calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore) {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0) {
			
			// redefine scatterplot data every time house values are changed
			var radarData = [
				{
					className: "house",
					axes: [
						{axis: "Oriëntatie", value: angleScore}, 
						{axis: "Verbruik", value: usageScore}, 
						{axis: "Rendement", value: panelScore},  
						{axis: "Dakoppervlak", value: surfaceScore},  
						{axis: "Dakhoek", value: angleScore}
					]
				}
			];
						
			svgRadar.append("g").classed("single", 1).datum(radarData).call(radar);
			
			console.log(orientation);
			insolationEfficiency = percentages[orientation]["angle"][angle];
									
			idealInsolation = (radiation*10000)/3600000;
			
			trueInsolation = idealInsolation*insolationEfficiency;
			
			capacity = surface*panel*inverterEfficiency;
			
			basicOutput = trueInsolation*capacity;
						
			productionDay = basicOutput*(1-(((temperature - 25)*coefficient))/100);
			productionYear = productionDay*365;
			
			totalCost = (surface/size)*cost;
									
			profit = productionYear*energy;
			
			payback = totalCost/profit;
						
			// update result div values when a new calculation is made
			$(".results > .production").text(parseInt(productionYear));
			$(".results > .profit").text(parseInt(profit));
			$(".results > .payback").text(parseInt(payback));					
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
		
		// select corresponding station data from json
		for (var i = 0; i < data.length; i++) {
			if (data[i].name == station) {
				console.log(data[i]);
			}					
		};
		
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);
	});
	
	// when an orientation is selected, display it in the button and store its value in a variable for calculation
	$("a[class=orientation-a]").on("click", function(){
		orientation = $(this).attr("data-orientation");
		orientationScore = parseInt($(this).attr("orientation-score"));
		$("button.button-width-orientation").text($(this).text());	
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);		
	});
	
	// when an angle is selected, display it in the button and store its value in a variable for calculation
	$("a[class=angle-a]").on("click", function(){
		angle = $(this).attr("data-angle");
		angleScore = parseInt($(this).attr("angle-score"));
		$("button.button-width-angle").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);
	});
	
	// when a surface is selected, display it in the button and store its value in a variable for calculation
	$("a[class=surface-a]").on("click", function(){
		surface = parseInt($(this).attr("data-surface"));
		surfaceScore = parseInt($(this).attr("surface-score"));
		$("button.button-width-surface").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);
	});
	
	// when a panel is selected, display it in the button and store its value in a variable for calculation
	$("a[class=panel-a]").on("click", function(){
		panel = parseFloat($(this).attr("data-panel"));
		panelScore = parseInt($(this).attr("panel-score"));
		$("button.button-width-panel").text($(this).text());
		coefficient = parseFloat($(this).attr("data-coefficient"));
		cost = parseInt($(this).attr("data-price"));
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);		
	});
	
	// when a usage is selected, display it in the button and store its value in a variable for calculation
	$("a[class=usage-a]").on("click", function(){
		usage = parseInt($(this).attr("data-usage"));
		usageScore = parseInt($(this).attr("usage-score"));
		$("button.button-width-usage").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage, orientationScore, angleScore, surfaceScore, panelScore, usageScore);
	});
	
	// map scale and position
	projection
		.scale(6000)
		.translate([-320, 6690]);

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
						
			// display the name of the clicked station in the button
			$("button.button-width-location").text(d[2]);
									
			// highlight the clicked dot and make all other dots red
			svgNL.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
		});
	
	// array of month abbreviations to check which array within a station object to load data from
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jaar"];	
	
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
			if (value == "Jaar") {
				console.log(data[station].dates);
			}
			
			else {
				// put the required line graph data in an array to shorten data calls
				lineData = data[station].dates[value]
				console.log(lineData);
												
				lineData.forEach(function(d) {
					d.date = new Date(d.date);
					d.radiation = +d.radiation;
					d.temperature = +d.temperature;
				});
				
				// define line variable
				var line = d3.svg.line()
					.x(function(d) { return x(d.date);})
					.y(function(d) { return y(d.radiation);});
				
				// line chart domains
				x.domain(d3.extent(data, function(d) { return d.date; }));
				y.domain([0, d3.max(data, function(d) { return d.radiation;})]);
								
				// add x-axis	
				svgChart.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + chartHeight + ")")
					.call(xAxis);
				
				// add y-axis
				svgChart.append("g")
					.attr("class", "y axis")
					.call(yAxis);	
				
				// Add the valueline path.
					//svgChart.append("path")
						//.datum(lineData)
						//.attr("class", "line")
						//.attr("d", line);				
			}
		});
		
	// add x-axis	
	svgChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + chartHeight + ")")
		.call(xAxis);
	
	// add y-axis
	svgChart.append("g")
		.attr("class", "y axis")
		.call(yAxis);		
    
	// call the slider to display it on the page
	d3.select("#slider").call(slider);	
};
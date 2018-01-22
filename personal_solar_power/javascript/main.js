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
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
	- https://woonbewust.nl/blog/soorten-zonnepanelen
	- https://www.zonne-paneel.net/prijs-zonnepanelen/
	- http://www.sun-solar.nl/index.php/product/solar-frontier-sf175-s-paneel-135-euro-incl-btw-sunsolar/
*/

var monthValue = "";
var station = "";

var yDomainMin;
var yDomainMax;

var xDomainMin;
var xDomainMax;

// variables to keep track of checkbox statuses
var radioStatus = 0;

// radar specifications
RadarChart.defaultConfig.color = function() {};
RadarChart.defaultConfig.radius = 3;
RadarChart.defaultConfig.w = 550;
RadarChart.defaultConfig.h = 550;

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

// add an svg element to put the radar chart into		
var svgRadar = d3.select("#radar").append("svg")
	.attr("width", 550)
	.attr("height", 500);
	svgRadar.append("g").classed("single", 1).datum(radarData).call(radar);

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
			
			Object.keys(data[station].dates).forEach(function(key,index) {
				lineData.push(data[station].dates[key]);
			} );
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
					.attr('x1', x(xDomainMin)).attr('y1', crossY)
					.attr('x2', x(xDomainMax)).attr('y2', crossY);
				focus.select("#focusTextY")
					.attr("transform", "translate(" + x(xDomainMin) + "," + (crossY - 10) + ")")
					.text(d.stats);					
				focus.select("#focusTextX")
					.attr("transform", "translate(" + textX + "," + (y(yDomainMax) - 15) + ")")
					.text(d.date);
			});
	}	
			
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
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
	var testRadiation = 1000;
	var testTemperature = 100;
	
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
						
			insolationEfficiency = percentages[orientation]["angle"][angle];
									
			idealInsolation = (testRadiation*10000)/3600000;
			
			trueInsolation = idealInsolation*insolationEfficiency;
			
			capacity = surface*panel*inverterEfficiency;
			
			basicOutput = trueInsolation*capacity;
						
			productionDay = basicOutput*(1-(((testTemperature - 25)*coefficient))/100);
			productionYear = productionDay*365;
			
			totalCost = (surface/size)*cost;
									
			profit = productionYear*energy;
			
			payback = totalCost/profit;
						
			// update result div values when a new calculation is made
			$(".results > .production").text(parseInt(productionYear));
			$(".results > .profit").text(parseInt(profit));
			$(".results > .payback").text(parseInt(payback));
			
			/*
			function processBar() {
				var wrapper = document.getElementById('progress');
				var start = 0;
				var end = parseFloat(wrapper.dataset.percentage);

				var colours = {
					fill: '#' + wrapper.dataset.fillColour,
					track: '#' + wrapper.dataset.trackColour,
					text: '#' + wrapper.dataset.textColour,
					stroke: '#' + wrapper.dataset.strokeColour,
				}

				var radius = 100;
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
				.innerRadius(radius)
				.outerRadius(radius - border);

				//setup SVG wrapper
				var svg = d3.select(wrapper)
					.append('svg')
					.attr('width', boxSize)
					.attr('height', boxSize)
					.attr('transform', 'translate(' + 850 + ',' + 20 + ')');

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
			
			for (var i = 0; i < 3; i++) {
				processBar()
			}
			*/
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
		
	function chartPlot(station, value) {
		monthValue = value;
		
		updateLine(station, monthValue, radioStatus);
	};	
	
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
			chartPlot(station, value)
		});
	   
	// call the slider to display it on the page
	d3.select("#slider").call(slider);		
};
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

// instantiate global variables
var data;
var nld;
var monthEfficiency;

// instantiate total house score variable
var houseScore = 0; 

var monthValue = "Jaar";
var station = "";

var lineData = [];

// array of month abbreviations to check which array within a station object to load data from
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jaar"];	

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

var dutchDate = {
				"decimal": ".",
				"thousands": ",",
				"grouping": [3],
				"currency": ["$", ""],
				"dateTime": "%a %b %e %X %Y",
				"date": "%d/%b/%Y",
				"time": "%H:%M:%S",
				"periods": ["AM", "PM"],
				"days": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
				"shortDays": ["zo", "ma", "di", "wo", "do", "vr", "za"],
				"months": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
				"shortMonths": ["jan", "feb", "maa", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
			};

// define date format
var format = d3.time.format("%Y-%b-%d").parse;

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

/*
	instantiate global variables
*/
var x;
var y;
var yTwo;
var xDomain;
var yDomain;	
var yDomainTwo;	
var yDomainMin;
var yDomainMinTwo;
var yDomainMax;
var yDomainMaxTwo;
var xDomainMin;
var xDomainMax;
var tempLine;
var radLine;
var	xAxis;
var yAxis;
var yAxisTwo;
var focus;
var tempActive = 1;
var radActive = 1;

var arc;
var pieText;
var pieTip;
var mapTip;
var radarTip;
var scoreTip;
var pie;
var piePath;
var labelArc;
var pieText;
var progressValue;
var colours;
var circle;
var track;
var trackPath;
var strokeSpacing;
var endAngle;
var progressMade = 0;
var midAngle;

var svgNL;
var svgChart;
var svg;
var g;
var svgPie = d3.select("#pie"),
	pieWidth = 260,
	pieHeight = 260,
	radius = Math.min(pieWidth, pieHeight) / 2,
	gPie = svgPie.append("g").attr("transform", "translate(" + (pieWidth / 2 + 15) + "," + (pieHeight / 2 + 15) + ")");

// select svg element to put the radar chart into
var svgRadar = d3.select("#radar")
	radarMargin = {top: 70, right: 70, bottom: 80, left: 80},
	radarWidth = 550 - radarMargin.left - radarMargin.right,
	radarHeight = 550 - radarMargin.top - radarMargin.bottom,
	gRadar = svgRadar.append("g").attr("transform", "translate(" + (radarWidth/2 + radarMargin.left) + "," + (radarHeight/2 + radarMargin.top) + ")");	
		
	
var cvg;

// instantiate variables for calculations
var orientation = "";
var angle = "";
var surface = 0;
var panel = "";
var coefficient = 0;
var efficiency = 0;
var cost = 0;
var usage = 0;
var orientationScore = 0;
var angleScore = 0;
var surfaceScore = 0;
var panelScore = 0;
var usageScore = 0;
var orientationEfficiency = 0;
	
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

var panels =	[
					{"panel": "mono", "efficiency": 0.17, "coefficient": 0.43, "score": 0},
					{"panel": "poly", "efficiency": 0.14, "coefficient": 0.45, "score": 0},
					{"panel": "amorf", "efficiency": 0.08, "coefficient": 0.20, "score": 0},
					{"panel": "cigs", "efficiency": 0.14, "coefficient": 0.36, "score": 0}						
				]
				
var bestEfficiency = 0;
var worstEfficiency = 1;
var bestCoefficient = 0;
var worstCoefficient = 1;

panels.forEach(function(d) {
	if (d.efficiency < worstEfficiency) {
		worstEfficiency = d.efficiency;
	};
	if (d.efficiency > bestEfficiency) {
		bestEfficiency = d.efficiency;
	};
	if (d.coefficient < worstCoefficient) {
		worstCoefficient = d.coefficient;
	};
	if (d.coefficient > bestCoefficient) {
		bestCoefficient = d.coefficient;
	};		
});	

panels.forEach(function(d) {
	d.score = ((1 - (d.coefficient - worstCoefficient)/(bestCoefficient - worstCoefficient)) + ((d.efficiency - worstEfficiency)/(bestEfficiency - worstEfficiency)))/2; 
});

var bestPanel = 0;
var worstPanel = 1;

panels.forEach(function(d) {
	if (d.score < worstPanel) {
		worstPanel = d.score;
	};
	if (d.score > bestPanel) {
		bestPanel = d.score;
	};
});
	
panels.forEach(function(d) {
	d.score = (d.score - worstPanel)/(bestPanel - worstPanel);
});

// general monthly shares of total yearly energy production
var monthFactors = 	[
						{"month": "Jan", "value": 0.03, "color": ""},
						{"month": "Feb", "value": 0.05, "color": ""},
						{"month": "Mar", "value": 0.08, "color": ""},
						{"month": "Apr", "value": 0.12, "color": ""},
						{"month": "May", "value": 0.13, "color": ""},
						{"month": "Jun", "value": 0.13, "color": ""},
						{"month": "Jul", "value": 0.13, "color": ""},
						{"month": "Aug", "value": 0.13, "color": ""},
						{"month": "Sep", "value": 0.11, "color": ""},
						{"month": "Oct", "value": 0.10, "color": ""},
						{"month": "Nov", "value": 0.07, "color": ""},
						{"month": "Dec", "value": 0.02, "color": ""},
					]				

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
					
// function to update the lines and axes when a new month or station is selected
function updateLine(station, monthValue, data, monthEfficiency) {
	
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
							return (Math.round(dailyResults(d.temperature, d.radiation, data, monthEfficiency)[0]) + " kWh	" + Math.round(dailyResults(d.temperature, d.radiation, data, monthEfficiency)[1]) + " euro");
						}
					});
			};
		});
}	

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

function updatePie(newPieData) {
	arc = arc.data(pie(newPieData));
	if (monthValue != "Jaar")
	{
		arc.transition()
			.duration(500)
			.attrTween("d", arcTween)
	};
	if (monthValue == "Jaar")
	{	
		arc.transition()
			.duration(500)
			.attrTween("d", arcTween)
			.style("fill", function(d) {return d.data["color"];});
	}		
	
	pieText.select("text").transition()
		.duration(500)
		.attrTween("transform", labelArcTween);
};
	
function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return piePath(i(t));
	};
};	

function labelArcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		var midAngle = i(t).endAngle < Math.PI ? i(t).startAngle/2 + i(t).endAngle/2 : i(t).startAngle/2  + i(t).endAngle/2 + Math.PI ;
		return "translate(" + labelArc.centroid(i(t))[0] + "," + labelArc.centroid(i(t))[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")";
	};
};

function updateProgress(houseScore) {
	colours = {
		fill: function() {
			if (houseScore <= 50) {
				return 'rgb(' + 255 + ',' + Math.round(5.1 * houseScore) + ',' + 0 + ')'
			}
			
			else {
				return 'rgb(' + (255 - Math.round(5.1 * (houseScore - 50))) + ',' + 255 + ',' + 0 + ')'
			}
		},
		track: "#ffffff",
		text: "00c0ff",
		stroke: "ffffff",
	};
	
	trackPath
		.transition()
		.duration(500)
		.attr('fill', colours.track)
		.attr('stroke', colours.stroke)
		.attr('stroke-width', strokeSpacing + 'px')
		.attr('d', circle.endAngle(endAngle));
	
	progressValue
		.transition()
		.duration(500)
		.attr('fill', colours.fill)
		.attr('stroke', colours.stroke)
		.attr('stroke-width', strokeSpacing + 'px')
		.attr('d', circle.endAngle(endAngle * (houseScore/100)));
		
	// define tooltip that shows the score on hover
	scoreTip.html(function(d) {
		return "<strong>Overall score: </strong> <span>" + parseFloat(houseScore/10).toFixed(1) + "</span>";
	});	
}

window.onload = function() {
	$('[data-toggle="popover"]').popover(); 
	
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
	
	// variables to keep track of checkbox statuses
	$('#check-temperature').prop('checked', true);
	$('#check-radiation').prop('checked', true);
	
	datasets();
}

function datasets() {
	// queue weather station data and map data
	d3.queue()
		.defer(d3.json, "datasets/data.json")
		.defer(d3.json, "datasets/map.json")
		.defer(d3.json, "datasets/months.json")
		.await(ready);
}

function ready(error, data, nld, monthEfficiency) {
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
				
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
	}
	
	// temperature line turns on or of depending on whether its checkbox is checked or not
	$(".check-temperature").on("click", function() {
		tempActive = tempLine.active ? false : true;
		
		newTempOpacity = tempActive ? 0 : 1;
		
		d3.select("#tempLine").style("opacity", newTempOpacity);
		
		tempLine.active = tempActive;
					
	})
	
	// radiation line turns on or of depending on whether its checkbox is checked or not
	$(".check-radiation").on("click", function() {
		radActive = radLine.active ? false : true;
		
		newRadOpacity = radActive ? 0 : 1;
		
		d3.select("#radLine").style("opacity", newRadOpacity);
		
		radLine.active = radActive;	
	})	
	
	lineChart(data);
	radarChart(radarData);
	pieColors(monthFactors, piePath);
	pieChart(data);
	drawMap(data, nld, monthEfficiency);
	
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
			monthValue = value;
			
			if (monthValue == "Jaar") {
				pieColors(monthFactors, piePath);
				updatePie(monthFactors);
			}
			else {
				gPie.selectAll("path")
					.style("fill", "#ffffcc")
				d3.select("#pieName" + value)
					.style("fill", "orange")
			};
			
			if (station != "") {
				updateLine(station, value, data, monthEfficiency);	
								
				calculation(data, monthEfficiency)
			}
		});
	   
	// call the slider to display it on the page
	d3.select("#slider").call(slider);		
	
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
		updateLine(station, monthValue, data, monthEfficiency);		
		calculation(data, monthEfficiency);
	});
	
	// when an orientation is selected, display it in the button and store its value in a variable for calculation
	$("a[class=orientation-a]").on("click", function(){
		orientation = $(this).attr("data-orientation");
		orientationEfficiency = parseFloat($(this).attr("data-efficiency"));
		orientationScore = parseFloat($(this).attr("orientation-score"));
		$("button.button-width-orientation").text($(this).text());	
		calculation(data, monthEfficiency);		
	});
	
	// when an angle is selected, display it in the button and store its value in a variable for calculation
	$("a[class=angle-a]").on("click", function(){
		angle = $(this).attr("data-angle");
		$("button.button-width-angle").text($(this).text());
		calculation(data, monthEfficiency);
	});
	
	// when a surface is selected, display it in the button and store its value in a variable for calculation
	$("a[class=surface-a]").on("click", function(){
		surface = parseInt($(this).attr("data-surface"));
		surfaceScore = parseFloat($(this).attr("surface-score"));
		$("button.button-width-surface").text($(this).text());
		calculation(data, monthEfficiency);
	});
	
	// when a panel is selected, display it in the button and store its values in a variable for calculation
	$("a[class=panel-a]").on("click", function(){
		panel = $(this).attr("data-panel");
		panels.forEach(function(d) {
			if (d.panel == panel) {
				panelScore = d.score;
				coefficient = d.coefficient;
				efficiency = d.efficiency;
			}
		}); 
		$("button.button-width-panel").text($(this).text());
		cost = parseInt($(this).attr("data-price"));
		calculation(data, monthEfficiency);		
	});
	
	// when a usage is selected, display it in the button and store its value in a variable for calculation
	$("a[class=usage-a]").on("click", function(){
		usage = parseInt($(this).attr("data-usage"));
		usageScore = parseFloat($(this).attr("usage-score"));
		$("button.button-width-usage").text($(this).text());
		calculation(data, monthEfficiency);
	});	
};
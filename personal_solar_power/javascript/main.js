/*
	Jesse Emmelot
	11963522

	Code sources:
	- country map (Phil Pedruco, no licence): http://bl.ocks.org/phil-pedruco/9344373
	- circle plotting (Phil Pedruco, no licence): http://bl.ocks.org/phil-pedruco/7745589
	- bootstrap dropdowns (no licence): https://www.bootply.com/113296
	- slider (Bjorn Sandvik, BSD-3-Clause): https://github.com/MasterMaps/d3-slider
	- radial progress bar (no license): https://codepen.io/shellbryson/pen/KzaKLe
	- line crosshairs (Mike Hadlow, no license): http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3
	- line crosshairs (no license): https://codepen.io/numberformat/pen/QjLeLP?editors=0110
	- radar chart (Nadieh Bremer, no licence): https://gist.github.com/nbremer/21746a9668ffdf6d8242#file-radarchart-js
	- pie chart (Mike Bostock, GPL-3.0): https://bl.ocks.org/mbostock/3887235
	- dual line chart (d3noob, no licence): http://bl.ocks.org/d3noob/e34791a32a54e015f57d
	- pie chart labels (Christian MilNeil, no license): http://bl.ocks.org/vigorousnorth/7331bb51d4f0c2ae0314
	- pie chart transition (Chuck Grimmett, no license): http://www.cagrimmett.com/til/2016/08/27/d3-transitions.html
	- other code examples: https://www.w3schools.com/
	
	Data sources:
	- KNMI (temperature/radiation data): http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- The Grid (calculation help): https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- Woonbewust (types of solar panels): https://woonbewust.nl/blog/soorten-zonnepanelen
	- Zonwatt (yearly roof angle efficiencies): http://www.zonwatt.nl/zonnepanelen-technische-informatie/
	- Zonne-paneel.net (panel prices): https://www.zonne-paneel.net/prijs-zonnepanelen/
	- Sun-solar (panel prices): http://www.sun-solar.nl/index.php/product/solar-frontier-sf175-s-paneel-135-euro-incl-btw-sunsolar/
	- Zonnepanelen.net (orientation efficiencies): https://www.zonnepanelen.net/zonnepanelen-plat-dak/
	- NASA (monthly roof angle efficiencies): https://eosweb.larc.nasa.gov/cgi-bin/sse/grid.cgi?&num=186143&lat=52.1&submit=Submit&hgt=100&veg=17&sitelev=&email=skip@larc.nasa.gov&p=grid_id&p=ret_tlt0&step=2&lon=5.18
	- Essent (basic monthly production contributions): https://www.essent.nl/content/particulier/kennisbank/zonnepanelen/opbrengst-zonnepanelen-per-maand.html#

*/

/*
	instantiate global variables
*/
// global dataset variable names
var data;
var nld;
var monthEfficiency;

// overall house score variable
var houseScore = 0; 

// global period and weather station variable names
var monthValue = "Jaar";
var station = "";

// array of month abbreviations to check which array within a station object to load data from
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jaar"];	

// define date format
var format = d3.time.format("%Y-%b-%d").parse;

var bisectDate = d3.bisector(function(d) { return d.date; }).left;

// line chart variables
var svgChart;
var lineData = [];
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
var tempCheck = 1;
var radCheck = 1;

// radar chart variables
var svgRadar;
var orientationScore = 0;
var angleScore = 0;
var surfaceScore = 0;
var panelScore = 0;
var usageScore = 0;
var radarData = [
	[
		{axis: "Oriëntatie", value: orientationScore},
		{axis: "Dakhoek", value: angleScore},
		{axis: "Dakoppervlak", value: surfaceScore},
		{axis: "Paneeltype", value: panelScore},
		{axis: "Verbruik", value: usageScore},								
	]
];
var radarTip;
var cfg;

// pie chart variables
var svgPie;
// general monthly shares of total yearly energy production used to make initial plot
var monthFactors = [
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
];	
var arc;
var pieText;
var pieTip;
var pie;
var piePath;
var labelArc;
var pieText;

// radial progress bar variables
var svg;
var g;
var progressValue;
var colours;
var circle;
var track;
var trackPath;
var strokeSpacing;
var endAngle;
var midAngle;
var scoreTip;
var progressMade = 0;

// map variables
var svgNL;
var svgChart;
var mapTip;

// calculation variables
var orientation = "";
var angle = "";
var surface = 0;
var panel = "";
var usage = 0;
var coefficient;
var efficiency;
var cost;
var orientationEfficiency;
var dailyTemp;
var dailyRad;
var capacity;
var inverterEfficiency = 0.95;

// common energy cost per kWh
var energy = 0.20;

// common size of one panel in square meters
var size = 1.65

// different types of solar panels and their characteristics
var panels = [
	{"panel": "mono", "efficiency": 0.17, "coefficient": 0.43, "price": 300, "score": 0},
	{"panel": "poly", "efficiency": 0.14, "coefficient": 0.45, "price": 225, "score": 0},
	{"panel": "amorf", "efficiency": 0.08, "coefficient": 0.20, "price": 150, "score": 0},
	{"panel": "cigs", "efficiency": 0.14, "coefficient": 0.36, "price": 180, "score": 0}						
]

/*
	determine how well each solar panel scores based on its efficiency, temperature coefficient and cost
*/				
var bestEfficiency = 0;
var worstEfficiency = 1;
var bestCoefficient = 0;
var worstCoefficient = 1;
var bestPrice = 0;
var worstPrice = 1;

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
	if (d.price < worstPrice) {
		worstPrice = d.price;
	};
	if (d.price > bestPrice) {
		bestPrice = d.price;
	};		
});	

panels.forEach(function(d) {
	d.score = ((1 - (d.coefficient - worstCoefficient)/(bestCoefficient - worstCoefficient)) + 
	((d.efficiency - worstEfficiency)/(bestEfficiency - worstEfficiency)) +
	(1 - (d.price - worstPrice)/(bestPrice - worstPrice))
	)/3; 
});

console.log(panels)

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
	d.score = Math.round((d.score - worstPanel)/(bestPanel - worstPanel)*10)/10;
});

/*
	when one of the five values radar chart has changed, take the updated value array as input to redraw the colored plot
*/
function updateRadar(radarData, cfg) {
	d3.select("#radar").select(".radarWrapper").remove();
	d3.select("#radar").select(".radarCircleWrapper").remove();
	d3.select("#radar").select(".tooltip").remove();
	
	// if the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i){return d3.max(i.map(function(o){return o.value;}))}));
	
	// dimension variables
	var allAxis = (radarData[0].map(function(i, j){return i.axis})),
		total = allAxis.length,
		radius = Math.min(cfg.w/2, cfg.h/2),
		angleSlice = Math.PI * 2 / total;
			
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
					
/*
	transition the lines for temperature and radiation based on which period and weather station is selected, 
	as well as hide or show the lines and their crosshair based on checkbox status.
*/
function updateLine(station, monthValue, data, monthEfficiency) {
	
	// if the whole year is selected, select data from all months
	if (monthValue == "Jaar") {
		lineData = [];
		
		for (var i = 0; i < ((months.length) - 1); i++) {
			for (var j = 0; j < data[station].dates[months[i]].length; j++) {
				lineData.push(data[station].dates[months[i]][j]);
			}
		}			
	}
	
	// otherwise select data from a particular month
	else {
		lineData = data[station].dates[monthValue]
	}
	
	// define variable to make changes to the line chart with
	var newLine = d3.select("#chart").transition();
				
	// define temperature domains		
	xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
	yDomain = y.domain(d3.extent(lineData, function(d) { return d.temperature; }));
	
	// x-axis domain for crosshair
	xDomainMin = 0;
	xDomainMax = lineData.length;
	
	// temperature y-axis domain for crosshair
	yDomainMin = d3.min(lineData, function(d) { return d.temperature; });
	yDomainMax = d3.max(lineData, function(d) { return d.temperature; });
	
	// apply the new line data and domain values to the corresponding parts
	newLine.select(".tempLines")
		.duration(500)
		.attr("d", tempLine(lineData))
		.attr("fill", "none");		
	if (monthValue == "Jaar") {
		newLine.select(".xAxis")
			.duration(500)
			.call(xAxis.tickFormat(d3.time.format("%b")));
	}
	else {
		newLine.select(".xAxis")
			.duration(500)
			.call(xAxis.tickFormat(d3.time.format("%d")));	
	}				
	newLine.select(".yAxis")
		.duration(500)
		.call(yAxis.tickFormat(d3.format(2)));
	
	// define radiation domains
	xDomain = x.domain(d3.extent(lineData, function(d) { return d.date; }));
	yDomainTwo = yTwo.domain(d3.extent(lineData, function(d) { return d.radiation; }));
	
	// radiation y-axis domain for crosshair
	yDomainMinTwo = d3.min(lineData, function(d) { return d.radiation; });
	yDomainMaxTwo = d3.max(lineData, function(d) { return d.radiation; });
	
	// apply the new line data and domain values to the corresponding parts
	newLine.select(".radLines")
		.duration(500)
		.attr("d", radLine(lineData))
		.attr("fill", "none");
	if (monthValue == "Jaar") {
		newLine.select(".xAxis")
			.duration(500)
			.call(xAxis.tickFormat(d3.time.format("%b")));
	}
	else {
		newLine.select(".xAxis")
			.duration(500)
			.call(xAxis.tickFormat(d3.time.format("%d")));
	}				
	newLine.select(".yAxisTwo")
		.duration(500)
		.call(yAxisTwo.tickFormat(d3.format(200)));	
	
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
					add all crosshair parts which follow the cursor around and
					show date, temperature, radiation, production and profit on a day
				*/
				focus.select('#focusLineX')
					.attr('x1', crossX).attr('y1', y(yDomainMin))
					.attr('x2', crossX).attr('y2', y(yDomainMax));
				focus.select("#focusTextX")
					.attr("transform", "translate(" + (textX + 30) + "," + (y(yDomainMax) - 15) + ")")
					.text(d.date.toString()
							.replace('Mon', '').replace('Tue', '').replace('Wed', '').replace('Thu', '').replace('Fri', '').replace('Sat', '').replace('Sun', '')
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
				focus.select('#focusCircle')
					.attr('cx', crossX)
					.attr('cy', crossY)
					.attr("stroke", "#cc0000")
					.attr("fill", "#cc0000");
				focus.select('#focusLineY')
					.attr('x1', 0).attr('y1', crossY)
					.attr('x2', 750).attr('y2', crossY);
				focus.select("#focusTextY")
					.attr("transform", "translate(" + 0 + "," + (crossY - 10) + ")")
					.text(function() {
						return (d.temperature + " °C");
					});											
				focus.select('#focusCircleTwo')
					.attr('cx', crossX)
					.attr('cy', crossYTwo)
					.attr("stroke", "#ffcc00")
					.attr("fill", "#ffcc00");
				focus.select('#focusLineYTwo')
					.attr('x1', 0).attr('y1', crossYTwo)
					.attr('x2', 750).attr('y2', crossYTwo);
				focus.select("#focusTextYTwo")
					.attr("transform", "translate(" + 0 + "," + (crossYTwo - 10) + ")")
					.text(function() {
						return (d.radiation + " J/cm2");
					});	

				/*
					show or hide lines and their corresponding crosshairs depending on checkbox statuses
				*/
				focus.select('#focusCircle')
					.attr('opacity', tempCheck)
				focus.select('#focusLineY')
					.attr('opacity', tempCheck)
				focus.select("#focusTextY")
					.attr('opacity', tempCheck)
				focus.select('#focusCircleTwo')
					.attr('opacity', radCheck)
				focus.select('#focusLineYTwo')
					.attr('opacity', radCheck)
				focus.select("#focusTextYTwo")
					.attr('opacity', radCheck)
				
			};
		});
}	

/*	
	determine which shade each month gets based on how high its yearly contribution value  to total energy production	
*/
function pieColors(pieData, piePath) {
	var least = 1;
	var most = 0;
	
	// determine smallest and largest value from the set to define domain
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

/*
	redistribute every slice (using the arcTween function) when results are updated, 
	recoloring every slice with the previously calculated values.
*/
function updatePie(newPieData) {
	// determine new angles based on data
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
	
	// update text position
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

/*
	determine new pie chart slice angles
*/
function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return piePath(i(t));
	};
};	

/*
	transition the bar to a new position along the circular track when the overall 
	score of the house changes, recoloring it using the embedded formulas.
*/
function updateProgress(houseScore) {
	// set new color based on the new score
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
	
	// refine track properties
	trackPath
		.transition()
		.duration(500)
		.attr('fill', colours.track)
		.attr('stroke', colours.stroke)
		.attr('stroke-width', strokeSpacing + 'px')
		.attr('d', circle.endAngle(endAngle));
	
	// transition bar to its new position
	progressValue
		.transition()
		.duration(500)
		.attr('fill', colours.fill)
		.attr('stroke', colours.stroke)
		.attr('stroke-width', strokeSpacing + 'px')
		.attr('d', circle.endAngle(endAngle * (houseScore/100)));
		
	// redefine tooltip that shows the score on hover
	scoreTip.html(function(d) {
		return "<strong>Overall score: </strong> <span>" + parseFloat(houseScore/10).toFixed(1) + "</span>";
	});	
}

/*
	prepare some assets and call dataset function
*/
window.onload = function() {
	// activate popover functionality
	$('[data-toggle="popover"]').popover(); 
	
	// set popover properties
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
	
	// pre-check the check boxes for the line chart
	$('#check-temperature').prop('checked', true);
	$('#check-radiation').prop('checked', true);
	
	datasets();
}

/*
	queue json datasets to be implemented. Data.json contains all weather station related information, 
	map.json contains data to plot the country map and months.json includes the monthly solar efficiencies 
	(when facing south) at all pickable roof angles.
*/
function datasets() {
	d3.queue()
		.defer(d3.json, "datasets/data.json")
		.defer(d3.json, "datasets/map.json")
		.defer(d3.json, "datasets/months.json")
		.await(ready);
}

/*
	initialize datasets as variables
*/
function ready(error, data, nld, monthEfficiency) {
	/*
		put all data into the appropriate format.
		Dates to date format, temperature and 
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
	
	// add weather station names to dropdown menu
	for(index in data)
	{
		$("#location ul").append('<li><a href="#" class="location-a" data-location="'+index+'"</a>'+index+'</li>');   
	}
	
	// temperature line turns on or of depending on whether its checkbox is checked or not
	$("#check-temperature").on("click", function() {
		if (tempCheck == 1) {
			tempCheck = 0
			d3.select("#tempLine").style("opacity", tempCheck);
		}
		else {
			tempCheck = 1
			d3.select("#tempLine").style("opacity", tempCheck);
		};
		
		// call line update function to show or hide crosshairs
		updateLine(station, monthValue, data, monthEfficiency);
					
	})
	
	// radiation line turns on or of depending on whether its checkbox is checked or not
	$("#check-radiation").on("click", function() {
		if (radCheck == 1) {
			radCheck = 0
			d3.select("#radLine").style("opacity", radCheck);
		}
		else {
			radCheck = 1
			d3.select("#radLine").style("opacity", radCheck);
		};
		
		// call line update function to show or hide crosshairs
		updateLine(station, monthValue, data, monthEfficiency);
	})	
	
	// plot initial empty line chart
	lineChart(data);
	
	// plot initial empty radar chart
	radarChart(radarData);
	
	// determine pie chart slice colors
	pieColors(monthFactors, piePath);
	
	// plot the initial pie chart based on initial values
	pieChart(data);
	
	// draw the map
	drawMap(data, nld, monthEfficiency);
	
	/* 
		add a slider to select which month the weather station data should be
		picked from. Sliding it will re-check weather the station has been changed
		and if so, loads the period data from the new station.
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
	
	// when an orientation is selected, display it in the button and store its values in a variable for calculation
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
	
	// when a surface is selected, display it in the button and store its values in a variable for calculation
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
				price = d.price;
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
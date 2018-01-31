// draw a radial progress bar showing the total score of the house
function progressBar(houseScore) {
	d3.select(".pie-description").transition()
		.duration(500)
		.style("top", "380px");
	
	var start = 0;
	var end = houseScore;
		
	// define tooltip that shows the score on hover
	scoreTip = d3.tip()
		.attr("class", "tip")
		.offset([-5, 0])
		.html(function(d) {
			return "<strong>Overall score: </strong> <span>" + parseFloat(houseScore/10).toFixed(1) + "</span>";
		});
	
	// make bar color scale with the score (higher = greener, lower = redder, yellow towards the middle)
	colours = {
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
	var progressRadius = 145;
	var border = 20;
	strokeSpacing = 0;
	endAngle = Math.PI * 2;
	var formatText = d3.format('.0%');
	var boxSize = progressRadius * 2;
	var count = end;
	var progress = start;
	var step = end < start ? -0.01 : 0.01;

	// define the circle
	circle = d3.svg.arc()
		.startAngle(0)
		.innerRadius(progressRadius)
		.outerRadius(progressRadius - border);

	// setup SVG wrapper
	svg = d3.select("#pie")
		.append('svg')
		.attr("class", "progress_svg")
		.attr('width', boxSize)
		.attr('height', boxSize);

	// add group container
	g = svg.append('g')
		.attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

	// setup track
	track = g.append('g').attr('class', 'radial-progress');
	trackPath = track.append('path')
			.attr('class', 'radial-progress__background')
			.attr('fill', colours.track)
			.attr('stroke', colours.stroke)
			.attr('stroke-width', strokeSpacing + 'px')
			.attr('d', circle.endAngle(endAngle));

	// add colour fill
	progressValue = track.append('path')
		.attr('class', 'radial-progress__value')
		.attr('fill', colours.fill)
		.attr('stroke', colours.stroke)
		.attr('stroke-width', strokeSpacing + 'px')
		.on('mouseover', scoreTip.show)
		.on('mouseout', scoreTip.hide);
		
	function update(progress) {
		// update position of endAngle
		progressValue.attr('d', circle.endAngle(endAngle * progress));		
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

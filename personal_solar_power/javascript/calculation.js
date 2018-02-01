function dailyResults(dailyTemp, dailyRad, data, monthEfficiency) {
	idealInsolation = (dailyRad*10000)/3600000;
	insolationEfficiency = monthEfficiency[monthValue]["angle"][angle];
	trueInsolationEfficiency = insolationEfficiency * orientationEfficiency;
	trueInsolation = idealInsolation * trueInsolationEfficiency;
	basicOutput = trueInsolation*capacity;
	productionDay = basicOutput*(1-(((dailyTemp - 25)*coefficient))/100);
	profitDay = productionDay*energy;
	
	var dailyArray = [productionDay, profitDay]
	
	return dailyArray;
};

/*
	determine monthly or yearly average temperature and radiation for calculation input
*/
function periodResults(monthValue, station, data, monthEfficiency) {
	var yearProduction = 0;
	var yearProfit = 0;
	var monthProduction = 0;
	var monthProfit = 0;
			
	if (monthValue != "") {			
		for (var i = 0; i < ((months.length) - 1); i++) {
			var tempProduction = 0;
							
			for (var j = 0; j < data[station].dates[months[i]].length; j++) {
				yearProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[0];
				yearProfit += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[1];
				tempProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[0];
			}
			
			monthFactors[i]["value"] = tempProduction;
		}
		
		var periodArray = [yearProduction, yearProfit]
								
		if (monthValue != "Jaar") {
			for (var i = 0; i < data[station].dates[monthValue].length; i++) {
				monthProduction += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation, data, monthEfficiency)[0];
				monthProfit += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation, data, monthEfficiency)[1];
			}
			
			periodArray.push(monthProduction);
			periodArray.push(monthProfit);
		}
					
		return periodArray;
	}
}

function scoreAngle(data, monthEfficiency) {
	var tempArray = Object.keys(monthEfficiency[monthValue]["angle"]).map(function ( key ) { return monthEfficiency[monthValue]["angle"][key]; });
	bestAngle = Math.max.apply( null, tempArray );
	worstAngle = Math.min.apply( null, tempArray );
	angleScore = ((monthEfficiency[monthValue]["angle"][angle]) - worstAngle)/(bestAngle - worstAngle);

	return angleScore;
};

/* 
	results calculation function
*/
function calculation(data, monthEfficiency) {
	if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel.length != 0 && usage != 0) {
		
		angleScore = scoreAngle(data, monthEfficiency);				
		houseScore = ((orientationScore + angleScore + surfaceScore + panelScore + usageScore)/5)*100; 
		
		// update radar chart data based on user inputs
		radarData = [
			[
				{axis: "Oriëntatie", value: orientationScore},
				{axis: "Dakhoek", value: angleScore},
				{axis: "Dakoppervlak", value: surfaceScore},
				{axis: "Paneeltype", value: panelScore},
				{axis: "Verbruik", value: usageScore},								
			]
		];
					
		d3.select("#radar").select(".radarWrapper").remove();
		d3.select("#radar").select(".radarCircleWrapper").remove();
		d3.select("#radar").select(".tooltip").remove();
		
		// update radar chart
		updateRadar(radarData, cfg);
					
		capacity = surface*efficiency*inverterEfficiency;
		totalCost = (surface/size)*cost;
		
		productionYear = periodResults(monthValue, station, data, monthEfficiency)[0];
		profitYear = periodResults(monthValue, station, data, monthEfficiency)[1];
		productionMonth = periodResults(monthValue, station, data, monthEfficiency)[2];
		profitMonth = periodResults(monthValue, station, data, monthEfficiency)[3];
		
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
		
		if (progressMade == 1)
		{
			updateProgress(houseScore);
		}	
		
		// update radial progress bar to reflect any changes in user input
		if (progressMade == 0) {
			progressBar(houseScore);
			progressMade = 1;
		}				
	}
};


# Personal Solar Power
###### Jesse Emmelot <br> 11963522

### Link to visualization
https://jemmelot.github.io/project/personal_solar_power/personal_solar_power.html

### Summary
This visualization will be made to inform people who are interested in personal solar energy, about the potential energy gains and financial gains for their house. It will offer charts to show relevant data of their local weather station as well as results for potential gains, based on their own input values.

### Problem statement
With climate being an important reoccurring topic of news and discussion, it is often stated that the individual can contribute in a positive way. One of the ways is personal solar energy, and although solar panels on regular houses are a common sight, it may not be clear to everyone what the benefits for them could be. This project targets every home owner with interest in personal solar power.

### Solution
This visualization shows the potential benefits of personal solar energy. More in depth images are in the doc folder, as well as the Design Document.

![](doc/maart_hoogeveen.png)

### Main features
- country map containing all weather stations, each clickable to update location *(MVP)*
- buttons to switch between displayable graphs *(MVP)*
- crosshairs along lines/bars on the graphs to show relevant data
- switches to switch between tooltip data at the crosshairs
- textboxes or drop down menus to input data for calculation *(MVP)*
- radar plot to show how well a house is suited for solar energy *(MVP)*
- two switchable radar plots to compare changes in house features
- radial progress bars that show the overall score of a house (bases on the average of its features scores) *(MVP)*

### Data sources
###### KNMI
http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
- temperature
- radiation

###### User Specific Inputs
- location (closest weather station)
- orientation
- roof tilt angle
- surface area
- panel type (efficiency)
- energy usage

###### Standard inputs
- inverter efficiency

### External components
- d3-tip
- datamaps
- d3.slider
- bootstrap
- d3-time-format
- jQuery

### Similar visualizations
- https://www.comparemysolar.nl/calculator-zonnepanelen/ <br><br>
This website has similar attributes to my idea, with an interactive map and drop down lists to specify the input values. The orientation and roof area are specified by selecting the roof boundary on the map itself, whereas I intent to also get these values from an input text box or drop down options list. The result on that website is presented as a list of possible solar panel brands, along with their output and gains with the previously given inputs. This is useful, though I might have the types of solar panels in a drop down list of options in order to keep the results more concise. 

- https://www.zonnepanelen.net/terugverdientijd-zonnepanelen-berekenen/ <br><br>
This website has a clear combination of text boxes and drop down lists, as well as a concise display of results. I intend to use a similar setup to get all the custom input values, since it is an easily understandable but effective way for users to specify their inputs. 

### Hardest parts 
One of the hardest parts of this visualization will be to link all data and charts together so that everything gets updated accordingly when a different weather station is selected, or different input values for the calculations are given. It will also be important to avoid wrong data being linked to a location since datasets from so many different locations are being used.

### Other sources
###### Information about the calculations
https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-pv-system-a-detailed-guide#

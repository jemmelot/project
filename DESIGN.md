# Design Document
###### Jesse Emmelot <br> 11963522

### Data sources
###### KNMI
http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
- temperature for all weather stations in 2017
- radiation for all weather stations in 2017

All KNMI data is in .txt format and can be converted to JSON by running a selfmade Python file. Before conversion the excess text at the top of every data file will be trimmed, after which each data category (date, temperature etc.) get their own JSON key name. To use the JSON data in JavaScript, categories can be called by their key name from the JSON files.

###### Zonnepanelen data
- https://www.zonne-energiegids.nl/soorten-zonnepanelen/ <br> Four common types of solar panel. These could easily be displayed in a dropdown menu.

- https://woonbewust.nl/blog/soorten-zonnepanelen <br> Also four types of solar panel, including efficiency percentage as well as pros and cons. These pros and cons could also be in a tooltip that gets displayed when a dropdown menu option is hovered over.

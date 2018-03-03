# Udacity Neighborhood Map Project
- This application loads a Google map with locations that are currently hard-coded into an array named 'locations'.  If the map fails to load for reasons other than internet connectivity an alert is displayed.
Markers for each location appear on the map and the names of each location appear in the Nav element, on the left side.
- When a marker is clicked it bounces once and an infoWindow opens, displaying the name of the location (from the title property of the marker), and the address, telephone number and hours (from the Foursquare API).  If the API data is not avialable the appropriate infoWindow field is noted. 
- The Nav element's visibility is toggled by the hamburger button at the top.  At screen sizes less that 1200px the Nav is off-screen by default.
- The Nav element has a Search field near the top.  The Search function matches the Search field text to location names or keywords that describe the location.  The Search function is initiated by the Search button.  If no match is found an alert is displayed.
- This project is published at [github.io](https://kokocrater.github.io/Udacity-Neighborhood-Map-Project/).
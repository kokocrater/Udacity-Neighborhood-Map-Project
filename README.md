# Udacity Neighborhood Map Project
- This application loads a Google map with locations that are currently hard-coded into an array named 'locations'.  If the map fails to load for reasons other than internet connectivity an alert is displayed.
Markers for each location appear on the map and the names of each location appear in the Nav element, on the left side.
- When a marker is clicked it bounces once and an infoWindow opens, displaying the name of the location (from the title property of the marker), and the address, telephone number and hours (from the Foursquare API).  If the API data is not available the appropriate infoWindow field is noted. 
- At screen sizes less that 1200px the Nav is off-screen by default and its visibility is toggled by the hamburger button at the top.
- The Nav element has a Search field near the top.  The Search function matches text entered into the Search field with location names or strings in the 'keywords' property of each location.  The Search function is initiated by the Search button.  If no match is found an alert is displayed.  Searches are case-insensitive.
- There is an auto-complete feature that will show suggested matches for the current Search field text below the Search field.  The suggestions will run the Search function when clicked.
- To install this project on a local machine clone this repository (which includes the required jQuery and knockout files).  Run the application by double-clicking the index.html file.
- This project is published at [github.io](https://kokocrater.github.io/Udacity-Neighborhood-Map-Project/).

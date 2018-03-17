# Udacity Neighborhood Map Project
- This application loads a Google map with locations that are hard-coded into an array named  'locations'.  If the map fails to load an alert is  displayed.
 Markers for each location appear on the map and the names of each location appear in the Nav element, on the left side.
- When a marker is clicked it bounces once and dislays an infoWindow with the name of the location (from the title property of the marker), and the address, telephone number and hours (from the  Foursquare API).
- When a location name in the Nav element is clicked the unclicked names are removed unless the list has already been filtered by a search.  The marker that corresponds to the clicked location bounces once and dislays an infoWindow.
- If the API data is not available the appropriate infoWindow field is noted. 
- The Nav element has a Search field near the top.  The Search function matches text entered into the Search field with location names or keywords for each location.  The Search function is called by keystrokes in the Search field.  Searches are case-insensitive.  An auto-complete function will provide a list of possible matches of keywords or locations.  Both the keywords and locations are clickable to filter the lists.  If there are no matches the Suggestions field will be noted.
- When there is text in the Search field a Clear Search button is visible.  Clicking it restors the map and Nav to their initial states.
- At screen sizes less that 1200px the Nav is off-screen by default and its visibility is toggled by the hamburger button at the top.
- To install this project on a local machine clone this repository (which includes the required  knockout.js and jquery.js files).  Run the application by double-clicking the index.html file.
- This project is published at [github.io](https://kokocrater.github.io/Udacity-Neighborhood-Map-Project/)
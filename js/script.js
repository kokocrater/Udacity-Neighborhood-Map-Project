"use strict"
var map;
var markers = ko.observableArray();
var titles = ko.observableArray();
var matches = ko.observableArray();
var locations = [
    {title: "Vernon\'s BBQ", location: {lat: 38.662186, lng: -90.3091335}, keywords: ["restaurants", "food", "dining", "barbecue", "BBQ"]},
    {title: "Blueberry Hill", location: {lat: 38.655825, lng: -90.3051857}, keywords: ["restaurants", "food", "dining", "burgers", "beer"]},
    {title: "Grill Stop", location: {lat: 38.6721711, lng: -90.338078}, keywords: ["restaurants", "food", "dining", "burgers", "steak"]},
    {title: "Pi Pizza", location: {lat: 38.65501260000001, lng: -90.2977494}, keywords: ["restaurants", "food", "dining", "pizza"]},
    {title: "House of India", location: {lat: 38.6611271, lng: -90.3559915}, keywords: ["restaurants", "food", "dining", "indian"]},
    {title: "The Tivoli Theater", location: {lat: 38.6556587, lng: -90.3033799}, keywords: ["movies", "theaters", "entertainment"]},
    {title: "The Hi-Pointe Theater", location: {lat: 38.6326471, lng: -90.3050145}, keywords: ["movies", "theaters", "entertainment"]},
    {title: "St Louis Art Museum", location: {lat: 38.6393062, lng: -90.2944911}, keywords: ["attractions", "museums", "art"]},
    {title: "St Louis Science Center", location: {lat: 38.62866289999999, lng: -90.2705766}, keywords: ["attractions", "museums", "education"]}
  ];

function initMap() {
    try{
        map = new google.maps.Map($('#map')[0], {//https://stackoverflow.com/questions/4069982/document-getelementbyid-vs-jquery
        center: {lat: 38.6505741992262, lng: -90.30530998931883},//https://stackoverflow.com/questions/9810624/how-to-get-coordinates-of-the-center-of-the-viewed-area-in-google-maps-using-goo
        zoom: 14,
      mapTypeControl: false
        });
    }
    catch(err) {
        window.alert("Google maps failed to load: " + err.message);
    }
  var infoWindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var label = (i+1).toString();
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      id: i,
      label: label,
    });
    marker.addListener('click', function() {
        openInfoWindow(this, infoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(this.setAnimation(null), 1000); //https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    });
    markers().push(marker);
    titles.push(marker.title);
  }
    showMarkers(markers);
}

function showMarkers(markers) {
    for (var i = 0; i < markers().length; i++) {
        markers()[i].setMap(map);
    }
}

function openInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
    // infoWindow.setContent('<div><strong>'+marker.title+'</strong></div>');
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    }
    //Since the foursquare api url doesn't accept place names (see: https://stackoverflow.com/questions/11583447/searching-venues-by-name-only),
    //this var takes the position of the marker, converts it to a string and removes the parentheses and space to match the format of the
    //foursquare 'll'.
    var ll = marker.position.toString().slice(1, -1).replace(', ', ',');
$.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: 'https://api.foursquare.com/v2/venues/explore?ll=' + ll + '&limit=30&client_id=IRNNRRUUJKOSZGGEO5TZUEEQOFPT0GBNZQOLJKKFY0CFFNN5&'+
    'client_secret=20XNYOIX4IORXRZ2B43UVSZWL4ITW35T2NHODZNRXPECOVGC&v=20180227',
    success: function(data){
        //parse the data response into the fields to be added to the infoWindow
        var address0 = data.response.groups[0].items[0].venue.location.formattedAddress[0];
        var address1 = data.response.groups[0].items[0].venue.location.formattedAddress[1];
        var phone = data.response.groups[0].items[0].venue.contact.formattedPhone;
        var hours = data.response.groups[0].items[0].venue.hours.status;
        if (!address0) {
            address0 = "Address is not available";
        }
        if (!address1) {
            address1 = '';
        }
        if (!phone) {
            phone = "No phone number available";
        }

        if (!hours) {
            hours = "Hours are not avialable";
        }
        //populate the infoWindow
        infoWindow.setContent('<div><strong>' + marker.title + '</strong></div><br>' +
            '<div>' + address0 + '</div>' +
            '<div>' + address1 + '</div>' +
            '<div>' + phone + '</div>' +
            '<div>' + hours + '</div>');
        }
    });
}

function AppViewModel() {
    this.search = ko.observable("");
    this.filterLocations = function() {
        //Because titles() is an array of strings and markers() is an array of objects constructed
        //in initMap() they are handled differently.  For titles() the array is cleared then repopulated
        //with matching titles.  For markers() the matching indexes are compared to it.  Markers
        //at non-matching indexes are hidden.
        titles.removeAll();
        for (var i = 0; i < locations.length; i++) {
            //If the text in the search box matches any location titles...
            if (this.search().toLowerCase() == locations[i].title.toLowerCase()) {
                //push the index of the matching location to matches().
                matches.push(i);
            } else {
                for (var j = 0; j < locations[i].keywords.length; j++) {
                    //or is the text in the seach box matches any keyword...
                    if (this.search().toLowerCase() == locations[i].keywords[j].toLowerCase()) {
                        //push the index of the matching location to matches().
                        matches.push(i);
                    }
                }
            }
        }
        //make the title(s) the only title(s) in the titles() observableArray.
        for (var k = 0; k < matches().length; k++) {
            var titleIndex = matches()[k];
            var matchedTitle = locations[titleIndex].title;
            titles.push(matchedTitle);
        }
        //hide un-matched markers
        for (var l = 0; l < matches().length; l++) {
                //Use the value of the current matches() item as the index of
                //a marker to be removed from markers()
                var markerIndex = matches()[l];
                //Replace the removed marker with 'null' so that indexes of
                //other markers remain the same.
                markers.splice(markerIndex, 1, null);//https://www.w3schools.com/jsref/jsref_splice.asp AND https://blog.mariusschulz.com/2016/07/16/removing-elements-from-javascript-arrays
        }
        for (var m = 0; m < markers().length; m++) {
            //Hide the markers that are not 'null'.
            if (markers()[m]) {
            markers()[m].setMap(null);
            }
        }
        this.search('');
        //If there are no matches, reset the map and alert the user.
        if (matches().length === 0) {
            this.resetMap();
            window.alert("No matches found!");
        }
    };

    this.resetMap = function() {
        this.search('');
        titles.removeAll();
        markers.removeAll();
        matches.removeAll();
        initMap();
    };
    this.toggleNav = function() {
    $('#nav').toggleClass('open');
    $('#toggle').toggleClass('open');
    };
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());



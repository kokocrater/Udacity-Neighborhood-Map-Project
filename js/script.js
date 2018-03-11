let map;
//markers[] stores the map markers created for each object in locations().
//See initMap().
let markers = [];
//titles() stores the title of each location that has an index matching the values in matches().
//See initMap() and showLocations.
let titles = ko.observableArray();
//matches() stores the index(es) of all locations at initialization/reset or all times that match a search.
//See initMap(), showLocations(), AppViewModel.selectTitle(), AppViewModel.searchLocations() and resetMap().
let matches = ko.observableArray();
//searchMatches is used for displaying possible search matches.
let autoMatches = ko.observableArray();
let locations = [
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
    "use strict";
    //https://stackoverflow.com/questions/4069982/document-getelementbyid-vs-jquery
    map = new google.maps.Map(document.getElementById('map'), {
        //https://stackoverflow.com/questions/9810624/how-to-get-coordinates-of-the-center-of-the-viewed-area-in-google-maps-using-goo
        center: {lat: 38.6505741992262, lng: -90.30530998931883},
        zoom: 13,
        mapTypeControl: false
        });

  let infoWindow = new google.maps.InfoWindow();

  for (let i = 0; i < locations.length; i++) {
    let position = locations[i].location;
    let title = locations[i].title;
    let label = (i+1).toString();
    let marker = new google.maps.Marker({
      position: position,
      title: title,
      id: i,
      label: label
    });
    addMarkerListener(marker);
    markers.push(marker);
    matches.push(i);
  }

  function addMarkerListener(marker) {
    marker.addListener('click', function() {
        openInfoWindow(marker, infoWindow);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //https://developers.google.com/maps/documentation/javascript/examples/marker-animations
        setTimeout(marker.setAnimation(null), 1000);
    });
}

    showLocations(matches);
}  //END initMap()

function handleScriptError() {
    alert('Google Maps failed to load!');
}

function showLocations(matches) {
    //displays all titles and markers that have indexes in matches().
    "use strict";
    titles.removeAll();
    for (let h = 0; h < markers.length; h++) {
    markers[h].setMap(null);
    }
    for (let i = 0; i < matches().length; i++) {
        let matchedIndex = matches()[i];
        markers[matchedIndex].setMap(map);
        titles.push(markers[matchedIndex].title);
    }
}

function openInfoWindow(marker, infoWindow) {
    "use strict";
    if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    }
    //Since the foursquare api url doesn't accept place names
    //(see: https://stackoverflow.com/questions/11583447/searching-venues-by-name-only),
    //'ll' takes the position of the marker, converts it to a string and removes
    //the parentheses and space to match the format of the foursquare 'll'.
    let ll = marker.position.toString().slice(1, -1).replace(', ', ',');
$.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: 'https://api.foursquare.com/v2/venues/explore?ll=' + ll + '&limit=30&client_id=IRNNRRUUJKOSZGGEO5TZUEEQOFPT0GBNZQOLJKKFY0CFFNN5&'+
    'client_secret=20XNYOIX4IORXRZ2B43UVSZWL4ITW35T2NHODZNRXPECOVGC&v=20180227',
    success: function(data){
        //parse the data response into the fields to be added to the infoWindow
        let address0 = data.response.groups[0].items[0].venue.location.formattedAddress[0];
        let address1 = data.response.groups[0].items[0].venue.location.formattedAddress[1];
        let phone = data.response.groups[0].items[0].venue.contact.formattedPhone;
        let hours = data.response.groups[0].items[0].venue.hours.status;
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
            '<div>' + hours + '</div>' +
            '<div><i>' + "Information provided by " + '<a href="http://foursquare.com" target="_blank">' +
            'foursquare.com</a></i></div>');
        }
    }).fail(function() {
        infoWindow.setContent('<div><strong>' + marker.title + '</strong></div><br>' +
            'Location data is not avialable at this time.');
    });
}

function AppViewModel() {
    "use strict";
    //https://discussions.udacity.com/t/knockout-js-this-hidemarkers-is-not-a-function/626387/2
    let self = this;
    self.search = ko.observable('');
    self.isVisible = ko.observable(true);
    self.selectTitle = function(location) {
        matches.removeAll();
        //Because 'enable' binding won't work with <li>,
        //keep clicked title from affecting UI while locations are filtered.
        if (titles().length < locations.length) {
            return;
        } else {
        //push the index of the selected title to matches().
        // https://discussions.udacity.com/t/how-to-get-the-index-from-a-value-of-a-knockout-array/197103
        let selectedTitleIndex = titles().indexOf(location);
        matches.push(selectedTitleIndex);
        showLocations(matches);
        }
    };
    self.searchLocations = function() {
        matches.removeAll();
        for (let i = 0; i < locations.length; i++) {
            //If the text in the search box matches any location titles...
            if (self.search().toLowerCase() == locations[i].title.toLowerCase()) {
                //push the index of the matching location to matches().
                matches.push(i);
            } else {
                for (let j = 0; j < locations[i].keywords.length; j++) {
                    //or is the text in the seach box matches any keyword...
                    if (self.search().toLowerCase() == locations[i].keywords[j].toLowerCase()) {
                        //push the index of the matching location to matches().
                        matches.push(i);
                    }
                }
            }
        }
        //If there are no matches, reset the map and alert the user.
        if (matches().length === 0) {
            window.alert('No matches found!');
            self.resetMap();
        } else {
        self.search('');
        $('.suggestions').empty();
        showLocations(matches);
        autoMatches.removeAll();
        }
    };

    self.autoComplete = function() {
        //https://www.youtube.com/watch?v=uaa9HVC-tQA
        autoMatches.removeAll();
        for (let k = 0; k < locations.length; k++) {
            //If the text in the search field matches any part of location title...
            if (self.search().length > 0 && locations[k].title.toLowerCase().indexOf(self.search().toLowerCase()) != -1) {
                //and if the title has not already been matched...
                if (autoMatches().indexOf(locations[k].title) == -1) {
                //add the title to the array.  The next for loop does the same with keywords.
                autoMatches.push(locations[k].title);
                }
            }
            for (let l = 0; l < locations[k].keywords.length; l++) {
                if (self.search().length > 0 && locations[k].keywords[l].toLowerCase().indexOf(self.search().toLowerCase()) != -1) {
                    if (autoMatches().indexOf(locations[k].keywords[l]) == -1) {
                    autoMatches.push(locations[k].keywords[l]);
                    }
                }
            }
        }
        $('.suggestions').text('Suggestions');
    };

    self.selectMatch = function(selection) {
        self.search(selection);
        $('.suggestions').empty();
        self.searchLocations();
    };

    //Called by the Clear Search button.
    self.resetMap = function() {
        self.search('');
        //Clear matches() and refresh it will indecies for all locations.
        matches.removeAll();
        for (let n = 0; n < locations.length; n++) {
            matches.push(n);
        }
        showLocations(matches);
        autoMatches.removeAll();
        $('.suggestions').empty();
    };

    self.toggleNav = function() {
        $('.nav').toggleClass('open');
        $('.toggle').toggleClass('open');
    };
} //END ViewModel

// Activates knockout.js
ko.applyBindings(new AppViewModel());



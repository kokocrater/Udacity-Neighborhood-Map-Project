let map;
//markers[] stores the map markers created for each object in locations().
let markers = [];
//matchedLocationIndexes() stores the indecies of all markers, or search-matched markers.
//Used to decide wich markers should be displayed.
let matchedLocationIndexes = ko.observableArray();
//matchedLocationTitles() stores the all markers, or search-matched markers.  It is used to populate
//the list of locations in the Nav element.
let matchedLocationTitles = ko.observableArray();
//keywordMatches is used for displaying possible search matches.
let keywordMatches = ko.observableArray();
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
    //Makes infoWindow avialable to the AppViewModel().  A wild guess after much try/fail.
    self.infoWindow = infoWindow;

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
        matchedLocationIndexes.push(i);
        matchedLocationTitles.push(marker);
    }

    function addMarkerListener(marker) {
        marker.addListener('click', function() {
            self.openInfoWindow(marker, infoWindow);
            //https://discussions.udacity.com/t/knockout-map-markers-and-asynchronous-loading/233147
            marker.setAnimation(google.maps.Animation.BOUNCE);
            //https://developers.google.com/maps/documentation/javascript/examples/marker-animations
            setTimeout(marker.setAnimation(null), 1000);
        });
    }

    showMarkers(matchedLocationIndexes());

}  //END initMap()



function handleScriptError() {
    alert('Google Maps failed to load!');
}

//Uses matchedLocationIndexes() to decide which markers should be displayed.
function showMarkers(matches) {
    for (let g = 0; g < markers.length; g++) {
        markers[g].setMap(null);
    }
    for (let i = 0; i < matches.length; i++) {
        let matchedIndex = matches[i];
        markers[matchedIndex].setMap(map);
    }
}

//Called when a marker or list item is clicked.
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
            //Post a note in the window for any data item that is not retrieved.
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
    //Stored text from the Search field.
    self.search = ko.observable('');
    //Boolean for visibility of the Nav element.
    self.seeNav = ko.observable(true);

    //Called when a title from the list is clicked.
    self.selectTitle = function(marker) {
        //When titles have already been filtered by a search,
        //prevent titles from being removed by more title clicks.
        if (matchedLocationTitles().length < markers.length) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(marker.setAnimation(null), 1000);
            openInfoWindow(marker, infoWindow);
        } else {
            //If the full list of titles is presented,
            //filter the view to the selected title.
            matchedLocationTitles.removeAll();
            matchedLocationTitles.push(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(marker.setAnimation(null), 1000);
            openInfoWindow(marker, infoWindow);
        }
    };

    //Called when a suggestion is clicked.
    self.selectMatch = function(selection) {
        self.search(selection);
        $('.suggestions').empty();
        keywordMatches.removeAll();
        matchedLocationTitles.removeAll();
        matchedLocationIndexes.removeAll();
        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations[i].keywords.length; j++) {
                //Find locations that have keywords that contain the current Search text.
                if (self.search().toLowerCase() == locations[i].keywords[j].toLowerCase()) {
                    //Push the markers for matched locations to matchedLocationTitles()
                    //and the indecies of the matches to matchedLocationIndexes().
                    matchedLocationTitles.push(markers[i]);
                    matchedLocationIndexes.push(i);
                    showMarkers(matchedLocationIndexes());
                }
            }
        }
        //If there are no matchedLocationTitles, reset the map and alert the user.
        // if (matchedLocationTitles().length === 0 && keywordMatches().length === 0) {
        if (matchedLocationTitles().length === 0) {
            window.alert('No matchedLocationTitles found!');
            self.clearSearch();
        } else {
            self.search('');
        }
    };

    //Called by keystrokes in the Search field.
    self.autoComplete = function() {
        //https://www.youtube.com/watch?v=uaa9HVC-tQA
        keywordMatches.removeAll();
        matchedLocationTitles.removeAll();
        matchedLocationIndexes.removeAll();
        $('.suggestions-list').empty();
        for (let k = 0; k < locations.length; k++) {
            //Find locations that have titles containing the current Search text.
            if (self.search().length > 0 && locations[k].title.toLowerCase().indexOf(self.search().toLowerCase()) != -1) {
                //Push the markers for matched locations to matchedLocationTitles()
                //and the indecies of the matches to matchedLocationIndexes().
                matchedLocationTitles.push(markers[k]);
                matchedLocationIndexes.push(k);
            }
            for (let l = 0; l < locations[k].keywords.length; l++) {
                //Find keywords that contain the current Search text.
                if (self.search().length > 0 && locations[k].keywords[l].toLowerCase().indexOf(self.search().toLowerCase()) != -1) {
                    if (keywordMatches().indexOf(locations[k].keywords[l]) == -1) {
                        //Push the matched keywords to leywordMatches().
                        keywordMatches.push(locations[k].keywords[l]);
                    }
                }
            }
        }
        //Populate the suggestions element with matched keywords.
        $('.suggestions').text('Suggestions');
        if (matchedLocationTitles().length === 0 && keywordMatches().length === 0) {
            $('.suggestions-list').text('There are matches for this search.');
        }
    };

    //Called by the Clear Search button.
    self.clearSearch = function() {
        self.search('');
        $('.suggestions-list').empty();
        infoWindow.close();
        keywordMatches.removeAll();
        matchedLocationTitles.removeAll();
        matchedLocationIndexes.removeAll();
        for (let n = 0; n < markers.length; n++) {
            matchedLocationTitles.push(markers[n]);
            matchedLocationIndexes.push(n);
        }
        $('.suggestions').empty();
        showMarkers(matchedLocationIndexes());
    };

    //Shows or hides the Nav element.
    self.toggleNav = function() {
        if (self.seeNav() === true) {
            return self.seeNav(false);
        } else {
            return self.seeNav(true);
        }
    };

    //Fade the Nav element in/out.
    // http://knockoutjs.com/examples/animatedTransitions.html
    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value));
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };
} //END ViewModel

// Activates knockout.js
ko.applyBindings(new AppViewModel());



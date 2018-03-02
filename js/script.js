var map;
markers = ko.observableArray();
titles = ko.observableArray();
locations = ko.observableArray([
    {title: 'Vernon\'s BBQ', location: {lat: 38.662186, lng: -90.3091335}, keywords: ['restaurants', 'food', 'dining', 'barbuecue']},
    {title: 'Blueberry Hill', location: {lat: 38.655825, lng: -90.3051857}, keywords: ['restaurants', 'food', 'dining', 'burgers', 'beer']},
    {title: 'Grill Stop', location: {lat: 38.6721711, lng: -90.338078}, keywords: ['restaurants', 'food', 'dining', 'burgers', 'steak']},
    {title: 'Pi Pizza', location: {lat: 38.65501260000001, lng: -90.2977494}, keywords: ['restaurants', 'food', 'dining', 'pizza']},
    {title: 'House of India', location: {lat: 38.6611271, lng: -90.3559915}, keywords: ['restaurants', 'food', 'dining', 'indian']},
    {title: 'The Tivoli Theater', location: {lat: 38.6556587, lng: -90.3033799}, keywords: ['movies', 'theaters', 'entertainment']},
    {title: 'The Hi-Pointe Theater', location: {lat: 38.6326471, lng: -90.3050145}, keywords: ['movies', 'theaters', 'entertainment']},
    {title: 'St Louis Art Museum', location: {lat: 38.6393062, lng: -90.2944911}, keywords: ['attractions', 'museums', 'art']},
    {title: 'St Louis Science Center', location: {lat: 38.62866289999999, lng: -90.2705766}, keywords: ['attractions', 'museums', 'education']}
  ]);

function initMap() {
    map = new google.maps.Map($('#map')[0], {//https://stackoverflow.com/questions/4069982/document-getelementbyid-vs-jquery
    center: {lat: 38.6505741992262, lng: -90.30530998931883},//https://stackoverflow.com/questions/9810624/how-to-get-coordinates-of-the-center-of-the-viewed-area-in-google-maps-using-goo
    zoom: 14,
  mapTypeControl: false
    });
  var infoWindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations().length; i++) {
    var position = locations()[i].location;
    var title = locations()[i].title;
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
    markers.push(marker);
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
            hours = "Hours are not avialable"
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
        var index;
        for (var i = 0; i < locations().length; i++) {
            //If the text in the search box matches any location titles...
            if (this.search().toLowerCase() == locations()[i].title.toLowerCase()) {
                //make the title the only title in the titles() observableArray.
                titles.removeAll();
                titles.push(locations()[i].title);
                this.hideMarkers(i);
            } else {
                for (var l = 0; l < locations()[i].keywords.length; l++) {
                    if (this.search() == locations()[i].keywords[l]) {
                    console.log(locations()[i].keywords[l]);
                        titles.removeAll();
                        titles.push(locations()[i].title);
                        this.hideMarkers(i);
                    }
                }
            }
        }
}
    this.resetMap = function() {
        this.search('');
        titles.removeAll();
        markers.removeAll();
        initMap();
    }
    this.toggleNav = function() {
    $('#nav').toggleClass('open');
    $('#toggle').toggleClass('open');
    }

    this.hideMarkers = function(i) {
        for (var j = 0; j < i; j++){
                    //Remove all of the markers with an index lower than the matched index..
                    markers()[j].setMap(null);
                }
                for (var k = i + 1; k < markers().length; k++) {
                    //and also remove all of the markers with an index higher than the matched index.
                    markers()[k].setMap(null);
                }
    }

    this.clickedLi = function() {
        console.log("list clicked");
    }
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());



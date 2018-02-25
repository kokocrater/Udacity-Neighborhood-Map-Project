var map;
var markers = [];

function initMap() {
    map = new google.maps.Map($('#map')[0], {//https://stackoverflow.com/questions/4069982/document-getelementbyid-vs-jquery
    center: {lat: 38.6505741992262, lng: -90.30530998931883},//https://stackoverflow.com/questions/9810624/how-to-get-coordinates-of-the-center-of-the-viewed-area-in-google-maps-using-goo
    zoom: 13,
  mapTypeControl: false
    });

    var locations = [
    {title: 'Vernons BBQ', location: {lat: 38.662186, lng: -90.3091335}},
    {title: 'Blueberry Hill', location: {lat: 38.655825, lng: -90.3051857}},
    {title: 'Grill Stop', location: {lat: 38.6721711, lng: -90.338078}},
    {title: 'Pi Pizza', location: {lat: 38.65501260000001, lng: -90.2977494}},
    {title: 'House of India', location: {lat: 38.6611271, lng: -90.3559915}},
    {title: 'The Tivoli Theater', location: {lat: 38.6556587, lng: -90.3033799}},
    {title: 'The Hi-Pointe Theater', location: {lat: 38.6326471, lng: -90.3050145}},
    {title: 'St Louis Art Museum', location: {lat: 38.6393062, lng: -90.2944911}},
    {title: 'St Louis Science Center', location: {lat: 38.62866289999999, lng: -90.2705766}}
  ];

  var infoWindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var label = (i+1).toString();
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      // animation: google.maps.Animation.DROP,
      id: i,
      label: label
    });

    marker.addListener('click', function() {
        openInfoWindow(this, infoWindow);
    });
    markers.push(marker);
  }
    showMarkers(markers);
}

function showMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        var listItem = '<p>' + markers[i].label + '. '+ markers[i].title + '</p>';
        markers[i].setMap(map);
        $('#list').append(listItem);
    }
}

function openInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
    infoWindow.setContent('<div><strong>'+marker.title+'</strong></div><br><div></div>');
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    }
}

function AppViewModel() {
    this.location = ko.observable("");
    this.toggleNav = function() {
    $('#nav').toggleClass('open');
    $('#toggle').toggleClass('open');
    }
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
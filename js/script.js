function initMap() {
    console.log("initMap");

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
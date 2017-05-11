// 1. show map for init location
// 2. search for places nearby the init location
// 3. add markers to the map for nearby places
// 4. add places into an observable array
// 5. list an observable array as selection
var initLoc = {
               "lat" : 55.75393030000001,
               "lng" : 37.620795
           };
var locName = "Moscow, Red Square";


function initApp() {
    ko.applyBindings(new ViewModel());
}

var ViewModel = function() {
    var self = this;
    self.initLocName = ko.observable(locName);
    self.markers = ko.observableArray([]);

    // initialize map function
    var map = new google.maps.Map(document.getElementById("map"), {
        center: initLoc,
        zoom: 15
      });
    var infowindow = new google.maps.InfoWindow();


    // searches for places nearby `loc` location
    function searchPlaces(loc) {
      // create places service
      var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: loc,
          radius: 500
        //   type: ['store']
        },
        // callback function for nearbySearch
        function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i]);
            }
          }
        });
    }


    // create marker function
    function createMarker(place) {
        var markerClick = function() {
            var thisMarker = this;
            infowindow.setContent(this.name);
            infowindow.open(map, this);
            if (this.getAnimation() == null) {
                this.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    thisMarker.setAnimation(null); }, 2000);
                }
                else {
                    this.setAnimation(null);
                    }
            }
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            name: place.name,
            itemClick: markerClick
        });
        google.maps.event.addListener(marker, "click", markerClick);
        self.markers.push(marker);
        }


    // This function takes the input value in the init loc text input
    // locates it, and then searches for nearby places.
    self.newInitLoc = function () {
      // Initialize the geocoder.
      var geocoder = new google.maps.Geocoder();
      // Get the address or place that the user entered.
      var address = self.initLocName();
      // Make sure the address isn't blank.
      if (address == "") {
        window.alert("You must enter an area, or address.");
      } else {
        // Geocode the address/area entered to get the center.
        // Then, center the map on it and zoom in
        geocoder.geocode(
          { address: address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              map.setCenter(results[0].geometry.location);
              searchPlaces(results[0].geometry.location);
            } else {
              window.alert("We could not find location " + address +
                            ".\nTry entering a more specific place.");
            }
          });
      }
    }
}

// 1. show map for init location
// 2. search for places nearby the init location
// 3. add markers to the map for nearby places
// 4. add places into an observable array
// 5. list an observable array as selection


var places = [
    {
        "name" : "Музей Огни Москвы",
        "lat" : 55.760834,
        "lng" : 37.6354031,
        "rating" : 4.6,
    },

    {
        "name" : "Музей Никулина",
        "lat" : 55.758032,
        "lng" : 37.62879100000001,
        "rating" : 4.8
    },

    {
        "name" : "Музей Экслибриса Международного Союза Книголюбов",
        "lat" : 55.760945,
        "lng" : 37.622805,
        "rating" : 4.9
    }
];

var initLoc =  {
               "lat" : 55.75393030000001,
               "lng" : 37.620795
            }

// initialize map function
var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
      center: initLoc,
    zoom: 14
  });
  infowindow = new google.maps.InfoWindow();

  // create places service
  var service = new google.maps.places.PlacesService(map);

    service.nearbySearch({
      location: initLoc,
      radius: 500,
    //   type: ['store']
    }, callback);
    }

// callback function for nearbySearch
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

// create marker function
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


document.getElementById('submit').addEventListener('click', newInitLoc);
// This function takes the input value in the find nearby area text input
// locates it, and then zooms into that area. This is so that the user can
// show all listings, then decide to focus on one area of the map.
function newInitLoc() {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entered.
  var address = document.getElementById('init-loc').value;
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoom in
    geocoder.geocode(
      { address: address,
        // componentRestrictions: {locality: 'New York'}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}

var initLoc = {
    "geometry" : {
        "location" : {
               "lat" : 45.2405036,
               "lng" : 9.529251199999976
           }
    },
    "name" : "London, United Kingdom"
}

var wiki = {
    "url" : "http://en.wikipedia.org/w/api.php?action=opensearch&" +
            "format=json&callback=wikiCallback&search=",
    "notFound" : "<p>No wikipedia articles found</p>",
    "load" : '<p>Loading data <i class="fa fa-spinner fa-pulse"></i></p>',
    "fail" : "<p>Wikipedia search failed, try again</p>",
    // limit  is a request number of results from wiki API
    "limit" : 2
}


var ViewModel = function() {
    var self = this;
    self.markers = ko.observableArray([]);
    self.initLocName = ko.observable(initLoc.name);
    // initialize map function
    var map = new google.maps.Map(document.getElementById("map"), {
        center: initLoc.geometry.location,
        zoom: 15,
        fullscreenControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
      });

    var searchAutoComplete = new google.maps.places.Autocomplete(
                        document.getElementById("place-search"));
    var userMenuDiv = document.getElementById("user-menu");
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(userMenuDiv);

    var tog = document.getElementById("tog");
    tog.addEventListener('click', function() {
        $(".list-filter").toggle("slow");
        $("#tog").toggleClass("rotate-right");
    });


    // search for places nearby `loc` location
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
            if (this.wikiLinks() === ''||this.wikiLinks() === wiki.fail) {
                this.wikiLinks(wiki.load);
                wikiSearch(this);
            }
            infoWindowInit(this);
            self.infoWindow.open(map, this);
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
            icon: 'images/pointer.png',
            position: place.geometry.location,
            name: place.name,
            itemClick: markerClick,
            isHidden: false,
            wikiLinks: ko.observable('')
        });
        google.maps.event.addListener(marker, "click", markerClick);
        self.markers.push(marker);
        return marker;
        }


    // Sets up lone info window
    // some of this code is taken from http://jsfiddle.net/SittingFox/nr8tr5oo/
    function infoWindowInit(marker) {
        // close infoWindow if it already open
        if (typeof self.infoWindow !== 'undefined' ) {
            self.infoWindow.close();
        }
        var infoWindowHTML =
            '<div id="info-window">' +
                '<h3 data-bind="text: name"></h3>' +
                '<div id="wiki-content" data-bind="html: wikiLinks"></div>' +
            '</div>';

        self.infoWindow = new google.maps.InfoWindow({
            content: infoWindowHTML
        });
        var isInfoWindowLoaded = false;

        google.maps.event.addListener(self.infoWindow, 'domready', function () {
            if (!isInfoWindowLoaded) {
                // binding marker data to info window!
                ko.applyBindings(marker, $("#info-window")[0]);
                isInfoWindowLoaded = true;
            }
        });
    }


    // load wikipedia data to the marker wikiLinks
    function wikiSearch(marker) {
        var wikiUrl = wiki.url + encodeURIComponent(marker.name) + '&limit=' + wiki.limit;
        // console.log(wikiUrl);
        var wikiRequestTimeout = setTimeout(function(){
            marker.wikiLinks(wiki.fail);
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function(response) {
                clearTimeout(wikiRequestTimeout);
                var articleList = response[1];
                var articleLinks = response[3];
                if (articleList.length === 0) {
                    marker.wikiLinks(wiki.notFound);
                    return;
                }
                marker.wikiLinks('<p>Wikipedia links:</p><ul class="wiki-list">');
                for (var i = 0; i<articleList.length; i++) {
                    marker.wikiLinks(marker.wikiLinks() + '<li class="wiki-item"><a class="wiki-link" href="' +
                                     articleLinks[i] + '">' +
                                     articleList[i] + '</a></li>');
                };
                marker.wikiLinks(marker.wikiLinks() + '</ul>');
            }
        }).fail(function() {
            marker.wikiLinks(wiki.fail);
        });
    }


    // This function takes the input value in the init loc text input
    // locates it, and then searches for nearby places.
    self.newInitLoc = function () {
        // clear all markers from the map
        for (var i = 0; i < self.markers().length; i++) {
          self.markers()[i].setMap(null);
        }
        // clear markers array
        self.markers([]);
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
                // create initial location marker
                results[0].name = self.initLocName();
                var marker = createMarker(results[0]);
                // infowindow.setContent(marker.name);
                // infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.DROP);
                marker.icon = "images/pointer-icon.png";
                // marker.icon = 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png';


              map.setCenter(results[0].geometry.location);
              searchPlaces(results[0].geometry.location);
            } else {
              window.alert("We could not find location " + address +
                            ".\nTry entering a more specific place.");
            }
          });
        }
    }


    // search query function with  subscribtion to all the events in search input
    self.query = ko.observable('');
    self.query.subscribe(function(value) {
        var markersMutated = false;
        for (var i = 0; i < self.markers().length; i++) {
            var marker = self.markers()[i];
            if(marker.name.toLowerCase().indexOf(value.toLowerCase()) == -1) {
                /**if the place is NOT relevant to the search, make the marker
                invisible and hide the marker from the markers list**/
                // check if marker is already hidden
                if (!marker.isHidden) {
                    marker.isHidden = true;
                    marker.setMap(null);
                    markersMutated = true;
                };
            } else {
                if (marker.isHidden) {
                    marker.isHidden = false;
                    marker.setMap(map);
                    markersMutated = true;
                };
            }
        }
        // force reload markers observableArray if one of the markers has mutated
        if (markersMutated) {
            var data = self.markers();
            self.markers(null);
            self.markers(data);
            data = null;
        }
    });
}



// Googleapis callback function. Initialize the app if `google` variable is defined.
function initApp() {
    if (typeof google !== 'undefined') {
        ko.applyBindings(new ViewModel());
    } else { googleError() };
}


function googleError() {
    window.alert ("Can't load google maps API");
}

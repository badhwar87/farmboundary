function myFunction() {
  var lat_org = document.getElementById("myForm").elements[0].value;
  var lng_org = document.getElementById("myForm").elements[1].value;
  latlng = [lat_org, lng_org];
  initialize();
};

function startup() {
// Map Center
  var myLatLng = new google.maps.LatLng("20.027836", "73.76681");
  // General Options
  var mapOptions = {
    zoom: 17,
    center: myLatLng,
    mapTypeId: 'satellite'
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  map.addListener("click", (mapsMouseEvent) => {
    newlatlng = mapsMouseEvent.latLng;
    latlng = [newlatlng.lat(), newlatlng.lng()];
    var latbox = document.getElementById('lat');
    var lngbox = document.getElementById('lng');
    latbox.value = latlng[0];
    lngbox.value = latlng[1];
    initialize();
  });
};

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;
  loclat = crd.latitude;
  loclng = crd.longitude;
  latlng = [loclat, loclng];
  var latbox = document.getElementById('lat');
  var lngbox = document.getElementById('lng');
  latbox.value = latlng[0];
  lngbox.value = latlng[1];
  initialize();
};

function eror(err) {
  alert("This browser does not support GeoLocation!");
};

function getLocation() {
    navigator.geolocation.getCurrentPosition(success, eror, options);
};

function tempAlert(msg,duration)
{
 var el = document.createElement("div");
 el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:white;");
 el.innerHTML = msg;
 setTimeout(function(){
  el.parentNode.removeChild(el);
 },duration);
 document.body.appendChild(el);
};

async function getapi() {
  if (typeof latlng == 'undefined') {
    startup();
    };
  endpoint = "http://45.249.108.79:8082/api/farm/point?lat=";
  string = endpoint.concat(latlng[0], "&lng=", latlng[1]);
  if (string) {
    tempAlert("Loading...", 5000);
    };
  response = await fetch(string).catch((error) => {
    alert("Oops! Failed to fetch. Please try again.");
    });
  data = await response.json();
  console.log(data);
  if (data.message) {
  alert(data.message);
  };
  return data;
};

//var myPolygon;
async function initialize() {
  data = await getapi();
  jsondata = await data.features[0].geometry.coordinates[0][0];
  // Map Center
  var myLatLng = new google.maps.LatLng(latlng[0], latlng[1]);
  // General Options
  var mapOptions = {
    zoom: 17,
    center: myLatLng,
    mapTypeId: 'satellite'
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  map.addListener("click", (mapsMouseEvent) => {
    newlatlng = mapsMouseEvent.latLng;
    latlng = [newlatlng.lat(), newlatlng.lng()];
    var latbox = document.getElementById('lat');
    var lngbox = document.getElementById('lng');
    latbox.value = latlng[0];
    lngbox.value = latlng[1];
    initialize();
  });

  // Polygon Coordinates
  var triangleCoords = []
  for (r of jsondata) {
    triangleCoords = triangleCoords.concat(new google.maps.LatLng(r[1], r[0]));
  }
  // Styling & Controls
  myPolygon = new google.maps.Polygon({
    paths: triangleCoords,
    draggable: true, // turn off if it gets annoying
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.25
  });

  myPolygon.setMap(map);
  //google.maps.event.addListener(myPolygon, "dragend", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "insert_at", getPolygonCoords);
  //google.maps.event.addListener(myPolygon.getPath(), "remove_at", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "set_at", getPolygonCoords);
}

//Display Coordinates below map
function getPolygonCoords() {
  var len = myPolygon.getPath().getLength();
  var htmlStr = "";
  for (var i = 0; i < len; i++) {
    htmlStr += "new google.maps.LatLng(" + myPolygon.getPath().getAt(i).toUrlValue(5) + "), ";
    //Use this one instead if you want to get rid of the wrap > new google.maps.LatLng(),
    //htmlStr += "" + myPolygon.getPath().getAt(i).toUrlValue(5);
  }
  document.getElementById('info').innerHTML = htmlStr;
}
function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}
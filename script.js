
var map = L.map('map', {
  minZoom: 2,
  maxZoom: 19,
  zoomControl: false,
}).setView([35, 0], 2).setMaxBounds([
  [90,-180],
  [-90, 180]
])

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function shadeColor(color, percent) {
    
  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  R = Math.round(R)
  G = Math.round(G)
  B = Math.round(B)

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

fetch('custom.geo.json')
  .then(response => response.json())
  .then(data => {
    // Here jsonData contains the parsed JSON data from the file
    // Proceed to put it in an array or use it as needed
    var jsonData = Array.isArray(data) ? data : [data];

    var uniqueNames = [];
    // Call a function or perform operations on the jsonData here
    // to ensure it is accessed only after it is available
    function sortJsonDataByProperty(propertyName) {
      if (jsonData[0].features) {
        jsonData[0].features.sort(function(a, b) {
          return a.properties[propertyName] - b.properties[propertyName];
        });
    
        var sortedNames = jsonData[0].features.map(function(feature) {
          return feature.properties.name;
        });
    
        sortedNames.reverse().forEach(function(name) {
          if (!uniqueNames.includes(name)) {
            uniqueNames.push(name);
          }
        });
      }
    }

    console.log(uniqueNames)
    sortJsonDataByProperty("gdp_md")
    
    function onEachFeature(feature, layer) {
      layer.on('click', function (e) {
        layer.bindPopup("<b>" + feature.properties.name + " (Continent: " + feature.properties.continent + ") </b>" + "<br><br> The GDP for this country was " + Math.floor(feature.properties.gdp_md/1000).toLocaleString() + " million USD as of " + feature.properties.gdp_year + ".<br><br>"
        + feature.properties.name + " had a population of " + feature.properties.pop_est.toLocaleString() + " as of " + feature.properties.pop_year + ".");
      });
    }
    
    console.log(uniqueNames)
    
    geojson = L.geoJson(jsonData, {
      onEachFeature: onEachFeature,
      style: function(feature) {
        console.log(-Math.log(uniqueNames.indexOf(feature.properties.name) + 1) * 17)
        return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: shadeColor("#9F2B68", -Math.log(uniqueNames.indexOf(feature.properties.name) + 1) * 19)}
      }
    }).addTo(map);
  })

  .catch(error => {
    // Handle any error that occurred while reading the file
    console.error('Error:', error);
  });
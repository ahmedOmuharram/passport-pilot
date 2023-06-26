
var map = L.map('map', {
  minZoom: 1,
  maxZoom: 19,
  zoomControl: false,
}).setView([35, 0], 1.5).setMaxBounds([
  [90,-180],
  [-90, 180]
])

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  noWrap: true,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    bounds: [
      [-90, -180],
      [90, 180]
    ]
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

    sortJsonDataByProperty("gdp_md")
    
    function onEachFeature(feature, layer) {
      layer.bindPopup("<b>" + feature.properties.name + " (Continent: " + feature.properties.continent + ") </b>" + "<br><br> The GDP for this country was around " + feature.properties.gdp_md.toLocaleString() + ",000,000 USD as of " + feature.properties.gdp_year + ".<br><br>"
      + feature.properties.name + " had a population of " + feature.properties.pop_est.toLocaleString() + " as of " + feature.properties.pop_year + ".");
      layer.on('click', function (e) {
        if (this.isPopupOpen()) {
          this.setStyle({
            'fillColor': '#7BC66C'
          });
        }
      });
      layer.on('mouseover', function () {
        if (!this.isPopupOpen()) {
          this.setStyle({
            'fillColor': '#7A2048'
          });
        }
      });
      layer.on('mouseout', function () {
        console.log(this.isPopupOpen())
        if (!this.isPopupOpen()) {
          this.setStyle({
            'fillColor': '#8A6CC6'
          });
        }
      });
      layer.on('popupclose', function () {
        this.setStyle({
          'fillColor': '#8A6CC6'
        });
      });
    }
       
    geojson = L.geoJson(jsonData, {
      onEachFeature: onEachFeature,
      style: function(feature) {
        return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: "#8A6CC6"}//shadeColor("#9F2B68", -Math.log(uniqueNames.indexOf(feature.properties.name) + 1) * 19)}
      }
    }).addTo(map);
  })

  .catch(error => {
    // Handle any error that occurred while reading the file
    console.error('Error:', error);
  });

// Get all the anchor elements in the navbar

const anchor = document.getElementById('about');
infoSection = document.getElementById('info');
mapSection = document.getElementById('map');

anchor.addEventListener('click', function(e) {
  e.preventDefault(); 
  if (infoSection.classList.contains('hidden')) {
    mapSection.classList.add('blur');
    infoSection.style.animation = 'float 9s ease-in-out infinite';
    infoSection.classList.remove('hidden');
  } else {
    map.closePopup();
    map.flyTo([35, 0], 2);
    mapSection.classList.remove('blur');
    infoSection.classList.add('hidden');
  }
});

// Function to convert CSV to JSON with required mapping
async function convertCSVtoJSON() {
  var response = await fetch('passport-data.csv');
  var csvData = await response.text();
  var jsonPassportData = Papa.parse(csvData, { header: false, delimiter: ',' }).data;
  var result = {};

  jsonPassportData.forEach(function (row) {
    var fromCountry = row[0]; 
    var toCountry = row[1];
    var visaType = row[2]; 

    if (!result[fromCountry]) {
      result[fromCountry] = [];
    }

    result[fromCountry].push({ toCountry: toCountry, visaType: visaType });
  });

  return result;
}

var jsonOutputData = [];

// Convert CSV to JSON
convertCSVtoJSON()
  .then(function (jsonPassportData) {
    jsonOutputData = jsonPassportData;
    console.log(jsonOutputData["Egypt"])
  })
  .catch(function (error) {
    console.error(error);
  });

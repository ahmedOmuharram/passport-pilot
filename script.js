
var map = L.map('map', {
  minZoom: 1,
  maxZoom: 19,
  zoomControl: false,
}).setView([35, 0], 1.5).setMaxBounds([
  [90,-180],
  [-90, 180]
])
/*
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  noWrap: true,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    bounds: [
      [-90, -180],
      [90, 180]
    ]
}).addTo(map);*/

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


    [...document.getElementsByTagName("a")].forEach(function(item) {
      // adding eventListener to the elements
      item.addEventListener('click', function() {
        // calling the methods
        // this.id will be the id of the clicked button
        // there is a method in the object by same name, which will be trigger
        obj[this.id]();
      })
    })

    geojson = L.geoJson(jsonData, {
      onEachFeature: onEachFeature,
      style: function(feature) {
        return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: "#8A6CC6"}
      }
    }).addTo(map);

    var obj = {
      gdp: function() {
        uniqueNames = []
        geojson.remove()
        sortJsonDataByProperty("gdp_md")
        geojson = L.geoJson(jsonData, {
          onEachFeature: onEachFeatureSort,
          style: function(feature) {
            var fillColorFeature = shadeColor("#9F2B68", -Math.log(uniqueNames.indexOf(feature.properties.name) + 1) * 19)
            return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: fillColorFeature}
          }
        }).addTo(map);
        console.log(uniqueNames)
      },
      pop: function() {
        uniqueNames = []
        geojson.remove()
        sortJsonDataByProperty("pop_est")
        geojson = L.geoJson(jsonData, {
          onEachFeature: onEachFeatureSort,
          style: function(feature) {
            var fillColorFeature = shadeColor("#9F2B68", -Math.log(uniqueNames.indexOf(feature.properties.name) + 1) * 19)
            return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: fillColorFeature}
          }
        }).addTo(map);
        console.log(uniqueNames)
      },
      visa: function() {
        uniqueNames = []
        geojson.remove()
        geojson = L.geoJson(jsonData, {
          onEachFeature: onEachFeature,
          style: function(feature) {
            return {color: "#000000", weight: 0.2, fillOpacity: 0.7, fillColor: "#8A6CC6"}
          }
        }).addTo(map);
        console.log(uniqueNames)
      },
    }

    
    function onEachFeature(featureExternal, layer) {
  
      layer.bindPopup("<b>" + featureExternal.properties.name + " (Continent: " + featureExternal.properties.continent + ") </b>" + "<br><br> The GDP for this country was around " + featureExternal.properties.gdp_md.toLocaleString() + ",000,000 USD as of " + featureExternal.properties.gdp_year + ".<br><br>"
      + featureExternal.properties.name + " had a population of " + featureExternal.properties.pop_est.toLocaleString() + " as of " + featureExternal.properties.pop_year + ".");
      layer.on('click', function () {
        if (this.isPopupOpen()) {
          this.setStyle({
            'fillColor': '#7A2048'
          });
        }

        var i = 0;
        map.eachLayer( function(layer) {
          let visaType;
          let countryInfo;
          if (layer.feature) {
            if (jsonOutputData[featureExternal.properties.iso_a2_eh]) {
              countryInfo = jsonOutputData[featureExternal.properties.iso_a2_eh].find(item => item.toCountry === layer.feature.properties.iso_a2_eh)
            }
            if (!countryInfo) {
              visaType = "Unknown"
            } else {
              visaType = countryInfo.visaType;
            }
            switch (visaType) {
              case 'Unknown':
                layer.setStyle({
                  // white
                  'fillColor': '#ffffff'
                });
                break;
              case 'visa required':
                layer.setStyle({
                  // orange
                  'fillColor': '#ffdfba'
                });
                break;
              case 'e-visa':
                layer.setStyle({
                  // blue
                  'fillColor': '#bae1ff'
                });
                break;
              case 'visa on arrival':
                layer.setStyle({
                  // brown
                  'fillColor': '#836953'
                });
                break;
              case 'visa free':
                layer.setStyle({
                  // green
                  'fillColor': '#baffc9'
                });
                break;
              case 'no admission':
                layer.setStyle({
                  // red
                  'fillColor': '#ffb3ba'
                });
                break;
              default:
                if (visaType == -1) {
                  layer.setStyle({
                    // yellow
                    'fillColor': '#ffffba'
                  });
                  break;
                } else if (7 <= visaType <= 360) {
                  layer.setStyle({
                    // pink
                    'fillColor': '#D198B7'
                  });
                  break;
                } else {
                  layer.setStyle({
                    // black
                    'fillColor': '#000000'
                  });
                }
            }
            //console.log(layer.feature.properties.name)         
          }
          i += 1;
          //console.log(i)
        });

      });
      /*layer.on('mouseover', function () {
        if (!this.isPopupOpen()) {
          this.setStyle({
            'fillColor': '#3D4AC2'
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
      });*/
    }

    function onEachFeatureSort(feature, layer) {
      layer.bindPopup("<b>" + feature.properties.name + " (Continent: " + feature.properties.continent + ") </b>" + "<br><br> The GDP for this country was around " + feature.properties.gdp_md.toLocaleString() + ",000,000 USD as of " + feature.properties.gdp_year + ".<br><br>"
      + feature.properties.name + " had a population of " + feature.properties.pop_est.toLocaleString() + " as of " + feature.properties.pop_year + ".");
    }

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
  var response = await fetch('passport-data-3.csv');
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
    console.log(jsonOutputData["EG"])
  })
  .catch(function (error) {
    console.error(error);
  });

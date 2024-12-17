let earthquakeLayer = L.layerGroup()

// get the function of color by depth
function getColor(depth) {
    return depth > 90 ? '#800026' :  // Dark Red
           depth > 70 ? '#E31A1C' :  // Red
           depth > 50 ? '#FC4E2A' :  // Orange-Red
           depth > 30 ? '#FD8D3C' :  // Orange
           depth > 10 ? '#FFFF00' :  // Yellow
                        '#90EE90';   // Light Green
}



function markerSize(magnitude) {
    return magnitude * 4;
}

// Create the createMap function.
function createMap() {

  // Create the tile layer that will be the background of our map.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps = {
    "Street": street,
  };

  // Create an overlayMaps object to hold the bikeStations layer.
  let overlayMaps  = {
    "earthquake": earthquakeLayer,
  };

  // Create the map object with options.
  let myMap = L.map("map", {
    center: [20, 0], 
    zoom: 2, 
    layers: [street, earthquakeLayer],
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  
  // function for style, little color box infront of the legend
  function getLegendStyle(color) {
    return `
        background: ${color};
        width: 18px; 
        height: 18px; 
        display: inline-block; 
        margin-right: 8px;
    `;
}
  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    // adding a solid white background 
    div.style.backgroundColor = "#FFFFFF";
    div.style.padding = "8px"; 
    div.style.borderRadius = "5px"; 
    
    
    let depths = [-10, 10, 30, 50, 70, 90];
    let labels = []; 
    
    for (let i = 0; i < depths.length; i++) {
        let color = getColor(depths[i]);
        labels.push(
            `<i style="${getLegendStyle(color)}"></i>` + 
            depths[i] + (depths[i + 1] ? `&ndash;${depths[i + 1]}` : '+')
        );
    }
    div.innerHTML += labels.join("<br>");
    return div;
    };
  legend.addTo(myMap);
};


  // Create the createMarkers function.
function createMarker(response) {
    // Pull the "features" property from response.data.
    let features = response.features;

    // Loop through the features array.
    for (let i = 0; i < features.length; i++){
        let [longitude, latitude, depth] = features[i].geometry.coordinates;
        let { mag, place } = features[i].properties;
    
        let earthquakeMarker = L.circleMarker([latitude, longitude], {
            radius: markerSize(mag),
            fillColor: getColor(depth),
            color: "#FFFFFF",
            weight: 1,     
            opacity: 1,
            fillOpacity: 0.8,
          }).bindPopup(`
            <h3>${place}</h3>
            <p>Magnitude: ${mag}</p>
            <p>Depth: ${depth} km</p>
          `);
        
    // Create a layer group that's made from the bike markers array, and pass it to the createMap function.
    earthquakeLayer.addLayer(earthquakeMarker);
    };
};




// Perform an API call to the Citi Bike API to get the station information.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
  .then(function (response) {
    createMap();
    createMarker(response);
  });
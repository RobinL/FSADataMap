L.TopoJSON = L.GeoJSON.extend({  
  addData: function(jsonData) {    
    if (jsonData.type === "Topology") {
      for (key in jsonData.objects) {
        geojson = topojson.feature(jsonData, jsonData.objects[key]);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    }    
    else {
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
  }  
})

$(function() {
    // create a map in the "map" div, set the view to a given place and zoom

    var map = L.map('map').setView([51.505, -0.09], 13);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18
    }).addTo(map);

    // L.marker([51.5, -0.09]).addTo(map)
    //    .bindPopup('This is one of the businesses')
    //    .openPopup();

    L.circle(
            [51.5, -0.09],
            100, {
                color: "#57CEFB",
                fillColor: "#FF0606",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
                fill: true,
                stroke: true
            }
        )
        .addTo(map);


    $.get('topo_json/topo_lad.json', function(topoData) {
     	
     	var myStyle = {
     	    "color": "#FF0606",
     	    "weight": 1,
     	    "opacity": 1,
     	    "fillColor": "#FF0606",
     	    "fillOpacity": 0.1

     	};

     	topoLayer = new L.TopoJSON();
     	  topoLayer.addData(topoData);
     	  topoLayer.setStyle(myStyle)
  			topoLayer.addTo(map);


  		topoLayer.eachLayer(handleLayer);  

  		// map.removeLayer(topoLayer)
  		// map.addLayer(topoLayer)

		map.on('click', function (e) {
  map.setView([52,0],7, {animate: true, duration: 5.0});
});  		


    }, 'json');
    
})

function handleLayer(layer){  
  var randomValue = Math.random()*0.5


  layer.setStyle({

    "fillOpacity": randomValue

  });


}
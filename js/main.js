//https://github.com/Leaflet/Leaflet.markercluster
//http://consumerinsight.which.co.uk/maps/hygiene
//

L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {
        if (jsonData.type === "Topology") {
            for (key in jsonData.objects) {
                geojson = topojson.feature(jsonData, jsonData.objects[key]);
                L.GeoJSON.prototype.addData.call(this, geojson);
            }
        } else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
        }
    }
})

$(function() {
    // create a map in the "map" div, set the view to a given place and zoom

    map = L.map('map').setView([51.505, -0.09], 13);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18
    }).addTo(map);

    // L.marker([51.5, -0.09]).addTo(map)
    //    .bindPopup('This is one of the businesses')
    //    .openPopup();



    $.get('topo_json/topo_lad.json', function(topoData) {


        allTopoJson = topoData
        var myStyle = {
            "color": "#06FF1A",
            "weight": 1,
            "opacity": 1,
            "fillColor": "#06FF1A",
            "fillOpacity": 0.1

        };

        topoLayer = new L.TopoJSON();
        topoLayer.addData(topoData);
        topoLayer.setStyle(myStyle)
        topoLayer.addTo(map);


        topoLayer.eachLayer(handleLayer);

        // map.removeLayer(topoLayer)
        // map.addLayer(topoLayer)

        // map.on('click', function(e) {
        //     map.setView([52, 0], 7, {
        //         animate: true,
        //         duration: 5.0
        //     });
        // });

        $("#prosecutions").change(function() {
            changeOptions()
        })

        $("#authority_select").change(function() {

            console.log(this.value)
            changeSelectBox(this.value)
        })



    }, 'json');

})

function handleLayer(layer) {
    var randomValue = Math.random() * 0.5

    layer.setStyle({

        "fillOpacity": randomValue

    });


}


function changeOptions() {


    d3.csv("data/prosecutions/prosecutions.csv", function(data) {

        addToMap(data)
    });


    function addToMap(data) {
        var markerArray = [];

        for (var i = 0; i < data.length; i++) {
            lat = data[i]["lat"]
            lng = data[i]["lng"]

            var pathOptions = {
                "color": "#FF0606",
                "weight": 0,
                "opacity": 1,
                "fillColor": "#FF0606",
                "fillOpacity": 1,
                "radius": 3

            };

            markerArray.push(L.circleMarker([lat, lng], pathOptions));

        };



        var group = L.featureGroup(markerArray).addTo(map);
        //map.fitBounds(group.getBounds());

    }

}


function writeSelectBox() {
    d3.csv("data/lookups/authoritynamesandcodes.csv", function(data) {

        var select_box = $("#authority_select")

        for (var i = 0; i < data.length; i++) {

            select_box.append($("<option></option>")
                .attr("value", data[i]["localauthoritycode"])
                .text(data[i]["localauthorityname"]));
        };

        //Also create global variable that llows us to lookup between code and LAD13CD code

        authorityLookup = {}
        for (var i = 0; i < data.length; i++) {
            authorityLookup[data[i]["localauthoritycode"]] = {
                "localauthorityname": data[i]["localauthorityname"],
                "LAD13CD": data[i]["LAD13CD"]
            }

        };

        


    });

};

writeSelectBox()

function changeSelectBox(authorityid) {
    //When a local authority is selected we want to pan and zoom to the local authority and display FHRS scores

    //First delete any existing FHRS ratings from the map

    //Then add the new ones.  We will want to colour code by score

    var authorityid = authorityid

    d3.csv("data/fhrs/" + authorityid + ".csv", function(data) {

        topoLayer.eachLayer(findLayer);



        function findLayer(layer) {
            
            if (layer.feature.id == authorityLookup[authorityid]["LAD13CD"]) {
              map.fitBounds(layer.getBounds());
              layer.setStyle({"opacity":1,"fillOpacity":0.3})
              debugger;
          
            } else {
              layer.setStyle({"opacity":0.3,"fillOpacity":0.1})
            }



           
            
        }


        addToMap(data)

    });


    function addToMap(data) {
        var markerArray = [];

        for (var i = 0; i < data.length; i++) {

            lat = data[i]["latitude"]
            lng = data[i]["longitude"]

            if (typeof lat === 'undefined') {
                continue
            };

            lat = lat + 0.0
            lng = lng + 0.0

            var pathOptions = {
                "color": "#0625FF",
                "weight": 0,
                "opacity": 1,
                "fillColor": "#0625FF",
                "fillOpacity": 1,
                "radius": 3

            };

            markerArray.push(L.circleMarker([lat, lng], pathOptions));

        };



        var group = L.featureGroup(markerArray).addTo(map);
        //map.fitBounds(group.getBounds());
    }


}


//Can we make the map zoom to the location of the view on startup if they are geoenabled?

//Can we group points as the user zoomes out?

//https://groups.google.com/forum/#!msg/leaflet-js/4ZJ4Ywcft5U/dhPeTQOxm5cJ
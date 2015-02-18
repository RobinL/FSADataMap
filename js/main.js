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
            "color": "#06C7FF",
            "weight": 1,
            "opacity": 1,
            "fillColor": "#06C7FF",
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
    

    layer.setStyle({

        "fillOpacity": 0.1

    });


}


function changeOptions() {


    d3.csv("data/prosecutions/prosecutions.csv", function(data) {

        addToMap(data)

        group.removeLayer()
    });


    function addToMap(data) {
        var markerArray = [];

        for (var i = 0; i < data.length; i++) {
            lat = data[i]["lat"]
            lng = data[i]["lng"]

            // var pathOptions = {
            //     "color": "#FF0606",
            //     "weight": 0,
            //     "opacity": 1,
            //     "fillColor": "#FF0606",
            //     "fillOpacity": 1,
            //     "radius": 3

            // };

            var redMarker = L.AwesomeMarkers.icon({
               icon: 'android-hand',
               markerColor: 'red',
               prefix: "ion"
             });


            markerArray.push(L.marker([lat, lng],{icon:redMarker}));

        };



        group = L.featureGroup(markerArray).addTo(map);
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
          
          
            } else {
              layer.setStyle({"opacity":0.3,"fillOpacity":0.1})
            }



           
            
        }


        addToMap(data)

    });


    function addToMap(data) {
        var markerArray = [];

        for (var i = 0; i < data.length; i++) {

            d = data[i]
            lat = d["latitude"]
            lng = d["longitude"]
            rating = d["ratingvalue"]
            businessname = d["businessname"]

            if (typeof lat === 'undefined') {
                continue
            };

            //Convert to numeric
            lat = lat + 0.0
            lng = lng + 0.0



            style = {
                    
                        "color": "#0625FF",
                        "weight": 0,
                        "opacity": 1,
                        "fillColor": getFillColour(rating),
                        "fillOpacity": 1,
                        "radius": 5

                    };

              function getFillColour(rating) {
               

                console.log(rating)
                var color = d3.scale.linear()
                    .domain([0,1,2,3,4,5])
                    .range(["#868686","#E60000", "#FF7611", "#FDC400", "#B4E800", "#63FE05"]);

                color = color(rating)
                if (rating == "Exempt"){
                  color = "#868686"
                }
                return color
              }


                  
          
                markerArray.push(L.circleMarker([lat, lng], style));

            };



            var group = L.featureGroup(markerArray).addTo(map);
            //map.fitBounds(group.getBounds());
        }


    }


//TODO:

//First, make sure the markers are coloured by the FHRS 

//Can we make the map zoom to the location of the view on startup if they are geoenabled?

//Can we group points as the user zoomes out?

//https://groups.google.com/forum/#!msg/leaflet-js/4ZJ4Ywcft5U/dhPeTQOxm5cJ
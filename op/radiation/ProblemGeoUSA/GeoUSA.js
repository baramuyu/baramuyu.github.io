/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1500 - margin.left - margin.right;
var height = 1300 - margin.bottom - margin.top;
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:1550,
    height:1200
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var g = svg.append("g");

var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 3]);//.precision(.1);
var path = d3.geo.path().projection(projection);


var dataSet = {};



function loadStations() { //(2)
    //Tooltips
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("opacity", 0)
        .attr("class","tooltip")
        .text("Loading");
        
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        //....
        var screencoord
        //var screencoord = projection([longitude, latitude]);
        g.selectAll(".station")
            .data(data)
            .enter().append("circle")
            .attr("r", 1)
            .attr("cx", function(d){ 
                screencoord = projection([d["ISH_LON(dd)"], d["ISH_LAT (dd)"]]);
                if(screencoord)
                    return screencoord[0]; })
            .attr("cy", function(d){ 
                screencoord = projection([d["ISH_LON(dd)"], d["ISH_LAT (dd)"]]);
                if(screencoord)
                    return screencoord[1]; })
            .attr("fill","blue")
            .attr("class","station")
            .on("mouseover", function(d) {      
                tooltip.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                tooltip.html(d.STATION)  
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 40) + "px");    
                d3.select(this).classed("hasData", true)
                console.log("on!")
                })                  
            .on("mouseout", function(d) {       
                tooltip.transition()        
                    .duration(200)      
                    .style("opacity", 0);
                d3.select(this).classed("hasData", false)
                console.log("out!")   
            });
    });

    loadStats();
}

function loadStats() { //(3)

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
        completeDataSet= data;

    var max = 0
    for (var station in completeDataSet["Feb"]) {
        if(max < completeDataSet["Feb"][station]["sum"])
            max = completeDataSet["Feb"][station]["sum"];
    }

    var rScale = d3.scale.linear();
    rScale //gdp / population
      .domain([0,max])
      .range([3, 20]);

    g.selectAll(".station")
        .transition().duration(0)
        .attr("r",function(d){return rScale((completeDataSet["Feb"][d.USAF] === undefined) ? 0 : completeDataSet["Feb"][d.USAF]["sum"]) })
        .attr("fill",function(d){return (completeDataSet["Feb"][d.USAF] === undefined) ? "grey" : "steelblue" })
		//....

    })
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

//(1)Start from here


d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features

    //svg.selectAll(".country").data(usMap).enter().... 
    // see also: http://bl.ocks.org/mbostock/4122298
    g.selectAll(".country")
        .data(usMap)
        .enter().append("path")
        .attr("d", path)
        .attr("class","country")
        .on("click", clicked);

    // g.append("path")
    //   .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
    //   .attr("id", "state-borders")
    //   .attr("d", path);

    loadStations();
});


// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(){

}


var updateDetailVis = function(data, name){
  
}



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}



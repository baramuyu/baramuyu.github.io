MapVis = function() {

};

MapVis.prototype.filterData = function(_data){
    return _data.filter(function(d){
        return d.name != "ALL RESERVOIR AVERAGE" && d.capacity != "NA" && d.id != "EXC" ; //"EXC"->dirty data
    })
}

MapVis.prototype.loadReservoirs = function(){
	var that = this;
	var screencoord

    this.r = d3.scale.linear()
        .domain([0, 2500000])
        .range([1, 10]);

	//var screencoord = projection([longitude, latitude]);
	that.g.selectAll(".station")
		.data(that.data)
		.enter().append("circle")
		.attr("r", function(d){ 
			console.log(d.capacity)
			return (!isNaN(d.capacity)) ? that.r(d.capacity) : 1 })
		.attr("cx", function(d){ 
			screencoord = that.projection([d["longitude"], d["latitude"]]);
			if(screencoord)
				return screencoord[0]; })
		.attr("cy", function(d){ 
			screencoord = that.projection([d["longitude"], d["latitude"]]);
			if(screencoord)
				return screencoord[1]; })
		.attr("fill","blue")
		.attr("class","station")
		.on("mouseover",function(d,i){ 
			that.tooltip.transition()        
			  .duration(200)      
			  .style("opacity", .9);

			var ent = "<br/>"
			var sp = "&nbsp;&nbsp;&nbsp;"

			that.tooltip.html(d.name)  //<br/> is return/enter
			  .style("left", (d3.event.pageX + 30) + "px")     
			  .style("top", (d3.event.pageY - 20) + "px"); 
		})
		.on("mouseleave",function(){
              that.tooltip.transition()        
              .duration(200)      
              .style("opacity", 0);
        })
};

MapVis.prototype.loadMap = function(){
	var that = this;

	d3.json("../data/CaliforniaCounty.json", function(error, data) {

		//Topojson...
		// http://www.mapshaper.org/
		// http://www.shpescape.com
		this.caMap = topojson.feature(data,data.objects.CaliforniaCounty).features
		//console.log(caMap);

		//svg.selectAll(".country").data(caMap).enter().... 
		// see also: http://bl.ocks.org/mbostock/4122298
		that.g.selectAll(".county")
			.data(caMap)
			.enter().append("path")
			.attr("d", that.path)
			.attr("class","county")
			//.on("click", clicked);

		// g.append("path")
		//   .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
		//   .attr("id", "state-borders")
		//   .attr("d", path);

		that.loadReservoirs();
	});

	
};

MapVis.prototype.createMap = function(_Data){

	this.data = this.filterData(_Data)

    //Tooltips
    this.tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("opacity", 0)
        .attr("class","tooltip")
        .text("Loading");

	margin = {top: 20, right: 20, bottom: 50, left: 50},
		width = 950 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	var bbVis = {
		x: 100,
		y: 10,
		w: width - 100,
		h: 300
	};

	// this.detailVis = d3.select("#mapVis").append("svg").attr({
	//	 width: width,
	//	 height: height
	// })

	this.canvas = d3.select("#mapVis").append("svg").attr({
		width: width + margin.left + margin.right,
		height: height + margin.top + margin.bottom
		})

	this.svg = this.canvas.append("g").attr({
			transform: "translate(-100,-200)scale(2)"
		})
		.style("stroke-width", ".5px");

	this.g = this.svg.append("g");

	this.projection = d3.geo.albersUsa()
		.translate([width / 2, height / 2]);//.precision(.1);
	this.path = d3.geo.path().projection(this.projection);

	console.log("projection:, ", this.projection)

	this.dataSet = {};

	this.loadMap();

};





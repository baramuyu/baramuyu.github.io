/**
 * CountVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
CountVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];

    // defines constants
    this.margin = {top: 20, right: 0, bottom: 30, left: 100},
    this.width = 750 - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
CountVis.prototype.initVis = function(){

    var that = this; // read about the this

    // --- ONLY FOR BONUS ---  implement zooming
    //svg
    this.svg = this.parentElement
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("id", "zooming")

    //area
    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d) { return that.x(d.time); })
      .y0(this.height)
      .y1(function(d) { return that.y(d.count); });

    // creates axis and scales
    this.x = d3.time.scale()
      .range([10, this.width]);

    //this.y = d3.scale.linear()
    //this.y = d3.scale.sqrt()
    this.y = d3.scale.pow()
        .exponent(1)
        .range([this.height, 0]);

    //zoom
    this.zoom = d3.behavior.zoom()
        .scaleExtent([1, 2])
        .on("zoom", that.zoomed);

    //brush
    this.brush = d3.svg.brush()
                  .on("brush", function(){
                    //console.log(that.brush.extent());

                    //trigger
                    $(that.eventHandler).trigger("selectionChanged", that.brush.extent());
                  });

    this.svg.append("g")
        .attr("class", "brush")
        .call(this.zoom);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        //.attr("transform", "translate(90,20)")
      .append("text")
        .attr("transform", "translate(10,0)")
        .attr("y", 6)
        .style("text-anchor", "start")
        .style("font-size","15px")
        .text("Votes");

    // constructs SVG layout
    this.svg_slider = this.parentElement.append("svg")

    //the slider -- see example at http://bl.ocks.org/mbostock/6452972
    this.addSlider(this.svg_slider)

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    this.displayData = this.data;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(){

    // TODO: implement update graphs (D3: update, enter, exit)
    // updates scales
    this.x.domain(d3.extent(this.displayData, function(d) { return d.time; }));
    this.y.domain(d3.extent(this.displayData, function(d) { return d.count; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // updates graph
    var path = this.svg.selectAll(".area")
      .data([this.displayData])

    path.enter()
      .append("path")
      .attr("class", "area")

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();

    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
      .selectAll("rect")
        .attr("height", this.height);

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CountVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function

    // do nothing -- no update when brushing


}


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */
var getInnerWidth = function(element) {
    var style = window.getComputedStyle(element.node(), null);

    return parseInt(style.getPropertyValue('width'));
}




/**
 * creates the y axis slider
 * @param svg -- the svg element
 */
CountVis.prototype.addSlider = function(svg){
    var that = this;

    // TODO: Think of what is domain and what is range for the y axis slider !!
    var sliderScale = d3.scale.linear().domain([0,200]).range([0,200])
    var powScale = d3.scale.linear().domain([0,200]).range([0.1,1])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));

        var sliderValue = sliderScale.invert(value);

        //updating y scale
        that.y = d3.scale.pow()
            .exponent(powScale(sliderValue))
            .range([that.height, 0]);

        //updating y axis
        that.yAxis = d3.svg.axis()
          .scale(that.y)
          .orient("left");

        //slider position changing
        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })

        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+0+","+30+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect")
        .attr({
            "class":"sliderHandle",
            y:200,
            width:20,
            height:10,
            rx:2,
            ry:2
        })
        .style({fill:"#333333"})
        .call(sliderDragBehaviour)

}

var currentScale = 1;
CountVis.prototype.zoomed = function(){
    var that = this;
    if(d3.event != null && currentScale != d3.event.scale ){
        d3.select("#zooming")
            .attr("transform", "translate("+(100+d3.event.translate[0])+",20)scale(" + d3.event.scale + ",1)")
        currentScale = d3.event.scale
    }
}




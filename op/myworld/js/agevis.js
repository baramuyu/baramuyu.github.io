/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */



/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * AgeVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
AgeVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    // defines constants
    this.margin = {top: 20, right: 0, bottom: 20, left: 20},
    this.width = 230 - this.margin.left - this.margin.right,
    this.height = 330 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
AgeVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    this.svg = this.parentElement
        //     .attr("width", this.width + this.margin.left + this.margin.right)
        //     .attr("height", this.height + this.margin.top + this.margin.bottom)
        // .append("g")
        //     .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    //TODO: create axis and scales
    // creates axis and scales
    this.x = d3.scale.linear()
        .range([30, this.width]);

    this.y = d3.scale.linear()
        //.range([0, this.height]);
        .range([0, 284]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .ticks(3);


    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(30,5)")
      .append("text")
        .attr("transform", "translate(10,0)")
        .attr("y", 6)
        // .attr("dy", ".71em")
        .style("text-anchor", "start")
        .style("font-size","15px")
        .text("Age distribution");

    // filter, aggregate, modify data
    this.wrangleData(this.data, null, null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
AgeVis.prototype.wrangleData= function(_filterFunction, start, end){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction, start, end);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AgeVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};


    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs
    // TODO: implement update graphs (D3: update, enter, exit)
    // updates scales

    that = this;

    this.area = d3.svg.area()
        .interpolate("step")
        .x0(30)
        .x1(function(d){ return that.x(d) })
        .y(function(d, i){ return that.y(i) });

    this.x.domain(d3.extent(this.displayData, function(d) { return d; }));
    this.y.domain(d3.extent(this.displayData, function(d, i) { return i; })); //same as this.y.domain([0,98])


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
      .attr("class", "area");

    path
      .transition().duration(0)
      .attr("d", this.area);

    path.exit()
      .remove();
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
AgeVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function
    this.wrangleData(this.data,selectionStart,selectionEnd)

    this.updateVis();

}


/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */



/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
AgeVis.prototype.filterAndAggregate = function(_filter,start,end){

    // create an array of values for age 0-100
    var res = d3.range(100).map(function () {
        return 0;
    });

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    filter = _filter;
    if (start != null){
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}
        filter = filter.filter(function(d){ 
            return start <= d.time && d.time <= end;
        })
    }

    var that = this;

    // accumulate all values that fulfill the filter criterion
    // TODO: implement the function that filters the data and sums the values
    filter.forEach(function(d){
        for (var i = 0; i <= 98; i++) {
            res[i] += d.ages[i];
        };
    })

    return res;
}





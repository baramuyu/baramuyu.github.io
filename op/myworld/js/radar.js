RadarVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.radarData = [[],[]];
    this.totalCount = 0;

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 20},
    this.width = 750 - this.margin.left - this.margin.right,
    this.height = 850 - this.margin.top - this.margin.bottom;

    this.initVis();

}

RadarVis.prototype.initVis = function(){

    var that = this; // read about the this

    this.svg = this.parentElement

    this.LegendOptions = ['All Time','Selection'];

    this.colorscale = d3.scale.category10();

    this.mycfg = {
      w: this.width,
      h: this.height,
      maxValue: 0.15,
      levels: 6,
      ExtraWidthX: 300      
    }

    this.maxValue

    // filter, aggregate, modify data
    this.wrangleData(this.data,null,null);

    //draw radarchart
    RadarChart.draw("#radar", that.displayData, this.mycfg);

    // call the update method
    this.updateVis();
}

RadarVis.prototype.wrangleData= function(_filterFunction, start, end){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction, start, end);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
}

RadarVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};

    that = this;

     this.svgMarker = d3.select("#radar")
        .select("svg")
        
    //Create the title for the legend
    var text = this.svgMarker.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,5)') 
        .attr("x", that.width - 70)
        .attr("y", 10)
        //.attr("font-size", "12px")
        .attr("fill", "#404040")
        .text("% of Total Votes, by Priority")
        .style("font-size","15px");
            
    //Initiate Legend   
    var legend = this.svgMarker.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 200)
        .attr('transform', 'translate(90,25)') 
        ;
        //Create colour squares
        legend.selectAll('rect')
          .data(that.LegendOptions)
          .enter()
          .append("rect")
          .attr("x", that.width - 65)
          .attr("y", function(d, i){ return i * 20;})
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d, i){ return that.colorscale(i);})
          ;
        //Create text next to squares
        legend.selectAll('text')
          .data(that.LegendOptions)
          .enter()
          .append("text")
          .attr("x", that.width - 52)
          .attr("y", function(d, i){ return i * 20 + 9;})
          .attr("font-size", "11px")
          .attr("fill", "#737373")
          .text(function(d) { return d; })
          .style("font-size","15px")
          ; 
}

RadarVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    this.radarData[1] = [];
    this.wrangleData(this.data,selectionStart,selectionEnd)
    //draw radarchart
    RadarChart.draw("#radar", this.displayData, this.mycfg);

    this.updateVis();

}

RadarVis.prototype.filterAndAggregate = function(_filter,start,end){

    var that = this;

    // create an array of values for prios 0-15
    var res = d3.range(16).map(function () {
        return {
        	title: "",
        	count: 0
        };
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
    }else{
        //first loading
        var cnt = 0;
        filter.forEach(function(d,i){
            d.prios.forEach(function(e){
                cnt += e;
            })
        })
        this.totalCount = cnt;
        console.log("totalCount ", this.totalCount)
    }

    var selCount = 0;
    // accumulate all values that fulfill the filter criterion
    filter.forEach(function(d){
        for (var i = 0; i < 16; i++) {
            res[i].count += d.prios[i];
            selCount += d.prios[i];
        };
    })
    
    //transform for radar

    i = 0;
    while(i<16){
        this.radarData[1].push({
            axis: this.metaData.priorities[i]["item-title"],
            value: res[i].count / selCount
        })
        if(start == null){
            this.radarData[0].push({
                axis: this.metaData.priorities[i]["item-title"],
                value: res[i].count / this.totalCount
            })
        }
        i++;
    }
    console.log(this.radarData)

    return this.radarData;
}
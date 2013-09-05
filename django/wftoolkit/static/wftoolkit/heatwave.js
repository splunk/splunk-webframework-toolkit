require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

// parallel coords!
// a visualisation technique for multidimensional categorical data
// you can drag the vertical axis for each section to filter things (try it out for yourself)

// --- settings ---
// none for the time being.
// TODO: add settings to choose which data goes where

// --- expected data format ---
// a splunk search like this: index=_internal sourcetype=splunkd_access | table method status

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    // require("css!wftoolkit/heatwave.css");

    var HeatWave = SimpleSplunkView.extend({

        className: "splunk-toolkit-heatwave",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type

            options: {} // the default for custom heatmap options.
        },

        output_mode: "json",

        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");

            // whenever domain or subdomain are changed, we will re-render.
            this.settings.on("change:domain", this._onDataChanged, this);
            this.settings.on("change:subdomain", this._onDataChanged, this);
        },

        createView: function() { 
            this.$el.html(''); // clearing all prior junk from the view (eg. 'waiting for data...')
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            // var field_list = _.pluck(this.resultsModel.data().fields, 'name');
            // var datas = data;
            // field_list = _.filter(_.flatten(field_list), function(d){return d[0] !== "_" });

            // data = {
            //     'results': datas,
            //     'fields': field_list
            // }
            return data;
        },

        updateView: function(viz, data) {
            // var fields = data.fields;
            viz = $("<div id='"+this.id+"_heatwave' class=HeatwaveContainer>").appendTo(this.el);
            var container = viz;
            this.div_id = '#'+viz.attr('id');
            this.div = d3.select(this.div_id);
            var svg_id = '#'+this.id + '_svg';

            function plot(jString){
                console.log('PLOT ACTIVATED');

                if (jString.length === 0){
                    return;
                } else if (jString[0].count === 0){
                    return;
                }

                var xoff= 100, padding= 50;

                var HeatMapPlot= this

                // if (getTimeRange()._constructorArgs[1] === "rt"){
                //     data.shift(); //Remove earliest column due to visual feature of "disappearing" buckets in realtime searches
                // }

                var join= heatMapStage.selectAll("g.col").data(data, HeatMapPlot.getMetaData),
                    span= data[0]._span;

                // if (span === undefined) {
                //     console.log("ERROR - Span is undefined!");
                //     return;
                // }
                var svgW= 800,
                    svgH= 400,
                    heatMapHeight= svgH-padding;

                // Remove first column (splunk sends empty bin)
                // This is done here because xDom needs to be calculated with the first column (so that the
                // time span can be shifted in the code below.
                //data.splice(0,1);

                updateYScale(data, heatMapHeight);

                var yAxisBoundingBox= this.heatMap.select("g.axis.y")[0][0].getBoundingClientRect(),
                    heatMapWidth= svgW-xoff-yAxisBoundingBox.width;

                this.updateXScale(data, heatMapWidth, heatMapHeight);
                this.updateColorScale(data);

                var newColumns= addColumns(join);

                var bucketSpan= data[0]._bucketSpan,
                    currentCols= this.heatMapStage
                        .selectAll("g.col")
                        .filter(inRange);

                console.log(currentCols)

                this.heatMap.transition().duration(this.durationTime).ease("linear")
                    .attr("transform", "translate(" + (yAxisBoundingBox.width + 5) + "," + (svgH - heatMapHeight - padding + 5) + ")");

                this.updateThresholdLines();

                currentCols.each(updateRects)
                    .call(move);

                join.exit()
                    .filter(function (d) { return !inRange(d); })
                    .transition().duration(this.durationTime)
                    .attr("opacity", 0)
                    .remove();

                function addColumns(d3set) {
                    alert('addin columns')
                    return d3set.enter().insert("g","g.axis").attr("class", "col")
                        /*.on("mouseover", function (d) {
                            HeatMapPlot.onXAxisMouseOver(this, HeatMapPlot, d); })
                        .on("mouseout", function (d) {
                            HeatMapPlot.onXAxisMouseOut(this, HeatMapPlot, d);})*/
                        .call(moveIn);
                }

                function updateRects(colData) {
                    alert('hi')
                    var rect= d3.select(this).selectAll("rect"),
                        join= rect.data(colData, HeatMapPlot.getBucket);

                    join.enter().insert("rect")
                        .on("mouseover", function(d){
                            d3.select(this).style("fill", "lightblue").classed("selected", true);
                            HeatMapPlot.heatMap.select("g.axis.y").selectAll("text").data(d, String).classed("selected",true);
                            //HeatMapPlot.onYAxisMouseOver(null, HeatMapPlot, HeatMapPlot.getBucket(d));
                        })
                        .on("click", function(){
                            var metaData = d3.select(this).select("title").text(), //There should be better solution like this.parent.data()._time?
                                epoch= HeatMapPlot.metaTimeToEpoch(HeatMapPlot.parseMetaData(metaData)),
                                field = HeatMapPlot.parseFieldFromMetaData(metaData),
                                colorDom= HeatMapPlot.colorScale.domain(),
                                step= (colorDom[1]-colorDom[0]) / HeatMapPlot.nDrilldownBuckets;
                                HeatMapPlot.setMetaData(epoch, epoch + span, field, step.toFixed(2));
                        })
                        .call(place)
                        .call(shape)
                        //.style("stroke","white") Instead of padding each column a stroke can be used.
                        .append("title")
                        .call(title, colData);

                    join.on("mouseout", function(d){
                        d3.select(this).style("fill", toColor(d)).classed("selected", false);
                        HeatMapPlot.heatMap.select("g.axis.y").selectAll("text").data(d, String).classed("selected",false);
                        //HeatMapPlot.onYAxisMouseOut(null, HeatMapPlot, HeatMapPlot.getBucket(d));
                    });

                    join.transition().duration(this.durationTime).ease("linear")
                        .style("fill", toColor)
                        .call(place)
                        .call(shape)
                        .select("title")
                        .call(title, colData);

                    join.exit().remove();
                }

                function title(selection, colData) {
                    selection
                        .text(function(d) {return colData._time + ";" + d[0] + ";" + d[1];})
                }

                function toColor(d) {
                    return HeatMapPlot.colorScale(HeatMapPlot.getValue(d) + HeatMapPlot.colorOffset);
                }

                function inRange(d) {
                    return d._time >= HeatMapPlot.xDom[0] && d._time <= HeatMapPlot.xDom[1];
                }

                function move(selection) {
                    selection
                        .transition().duration(HeatMapPlot.durationTime).ease("linear")
                        .attr("transform", function (d) { return "translate(" + HeatMapPlot.xScale(d._time) + ",0)"; })
                        .attr("opacity", 1);
                }

                function moveIn(selection) {
                    selection
                        .attr("opacity", 0)
                        .attr("transform", function (d) {
                            return "translate(" + (HeatMapPlot.xScale(d._time) + HeatMapPlot.bucketWidth) + ",0)";
                        });
                }

                function shape(selection) {
                    selection
                        .attr("width", HeatMapPlot.bucketWidth)
                        .attr("height", HeatMapPlot.bucketHeight)
                        .style("fill", toColor);
                    //.style("stroke", toColor)
                    //.style("stroke-width",1)
                }

                function place(selection) {
                    selection
                        .attr("y", function(d) {
                            return HeatMapPlot.yScale(HeatMapPlot.getBucket(d));
                        });
                }

                //HeatMapPlot.xScale= xScale;
            }

            function clearPlot() {
                this.heatMapStage.selectAll("g.col").remove();
                this.xDom= null;

            }

            function argmax(arr) {
                var lengths= arr.map(function (d) { return d.length; });
                return lengths.indexOf(d3.max(lengths))
            }

            function calculateYDomain(data){
                var allFields= data.map(function (col) { return col.map( function (d) { return d[0]; }); });
                return d3.merge(allFields);
                //return data[this.argmax(data)].map(function (d) {return d[0];});
                //var that= this;
                //return [d3.min(data, function (colData) { return that.getBucket(colData[0])[0]; }), //selectAll rect?
                //    d3.max(data, function (colData) { return that.getBucket(colData[colData.length-1])[1]; })];
            }

            function calculateYScale(domain, height){
                return d3.scale.ordinal().domain(domain).rangeBands([height, 0]);
                //return d3.scale.linear().domain(domain).range([height, 0]);
            }

            function updateYScale(data, height){
                var yDom= calculateYDomain(data);

                this.yScale= calculateYScale(yDom, height);

                var nBuckets= this.yScale.domain().length;

                this.bucketHeight= height / (nBuckets);

                var yAxis= d3.svg.axis()
                    .scale(this.yScale)
                    .orient("left")
                    .ticks(Math.min(nBuckets,10))
                    .tickSubdivide(0)
                    .tickSize(6,3,3);

                var axis= this.heatMap.select("g.axis.y").transition().duration(this.durationTime).ease("linear")
                    .call(yAxis);

                var that= this;
                this.heatMap.select("g.axis.y").selectAll("text")
                    .on("mouseover", function (d) { that.onYAxisMouseOver(this, that, d); })
                    .on("mouseout", function (d) { that.onYAxisMouseOut(this, that, d); })
                    .on("click", function (d) { that.drillDownOnYAxisField(d); });
            }

            function onYAxisMouseOver(selection, that, d) {
                d3.select(selection).attr("class", "selected");

                that.heatMap.insert("line","line.threshold")
                    .call(that.horizontal, that, that.yScale(d))
                    .attr("class", "selection");

                that.heatMap.insert("line","line.threshold")
                    .call(that.horizontal, that, that.yScale(d)+that.bucketHeight)
                    .attr("class", "selection");
            }

            function onYAxisMouseOut(selection, that, d) {
                d3.select(selection).attr("class","");
                that.heatMap.selectAll("line.selection").remove();
            }

            function onXAxisMouseOver(selection, that, d) {
                d3.select(selection).classed("selected", true);

                that.appendLine(that,
                    that.xScale(d._time),
                    that.xScale(d._time),
                    0,
                    that.yScale(""))
                    .attr("class", "selection");

                that.appendLine(that,
                    that.xScale(d._time) + that.bucketWidth,
                    that.xScale(d._time) + that.bucketWidth,
                    0,
                    that.yScale(""))
                    .attr("class", "selection");
            }

            function onXAxisMouseOut(selection, that, d) {
                d3.select(selection).classed("selected",false);
                that.heatMap.selectAll("line.selection").remove();
            }

            function appendLine(that, x1,x2,y1,y2) {
                return that.heatMap.insert("line","line.threshold")
                    .attr("x1", x1)
                    .attr("x2", x2)
                    .attr("y1", y1)
                    .attr("y2", y2);
            }

            function horizontal(selection, that, y) {
                selection.attr("x1", that.xScale(that.xDom[0]))
                    .attr("x2", that.xScale(that.xDom[1]))
                    .attr("y1", y)
                    .attr("y2", y);
            }

            function updateXScale(data, width, height) {

                this.updateXDom(data);

                // leave 1 pixel for space between columns
                var nColumns= (this.xDom[1].getTime() - this.xDom[0].getTime()) / (data[0]._span * 1000);
                this.bucketWidth = (width / nColumns)-1;

                this.xScale= this.calculateXScale(this.xDom, width);

                var xAxis= d3.svg.axis()
                    .scale(this.xScale)
                    .orient("bottom")
                    .ticks(10)
                    .tickSubdivide(nColumns / 9)
                    .tickSize(6,3,3);

                this.heatMap.select("g.axis.x").transition().duration(this.durationTime).ease("linear")
                    .attr("transform", "translate(0," + (height) + ")")
                    .call(xAxis);

            }

            function addTime(date, time) {
                return new Date(date.getTime() + time);
            }

            function shiftXDomain(time) {
                this.xDom[1]= this.addTime(this.xDom[1], time);
                this.xDom[0]= this.addTime(this.xDom[0], time);
            }

            function updateXDom(data){
                var newXDom= d3.extent(data, this.getTime),
                    span= data[0]._span * 1000;

                newXDom[1]= this.addTime(newXDom[1], span); //Changes time axis to deal with time spans not time points.

                if (!this.xDom)
                {
                    this.xDom= newXDom;

                    // Shift the xDomain 1 column to the right.
                    //this.shiftXDomain(span);
                }
                else
                {
                    // Include more data
                    if (newXDom[0] < this.xDom[0]){
                        this.xDom[0]= newXDom[0];
                    }

                    //console.log("old time:",this.xDom)
                    //console.log("new time:",newXDom)

                    // Sift if realtime data appears
                    if (newXDom[1] > this.xDom[1]){
                        var time= newXDom[1].getTime() - this.xDom[1].getTime();
                        this.shiftXDomain(time);
                    }
                }
            }

            function calculateXScale(domain, width) {
                return d3.time.scale().domain(domain).range([0, width]);
            }

            function updateColorScale(data) {
                var colorDom= [d3.min(data, function (d) { return d._extent[0]; }) + this.colorOffset,
                    d3.max(data, function (d){ return d._extent[1]; }) + this.colorOffset];

                this.colorScale= this.colorScale.domain(colorDom).range(this.colorRange);
            }

            function updateThresholdLines(){
                var lowerThresholdLine= this.heatMap.selectAll("line.threshold.lower").data(this.lowerThreshold, function (d) {return d;}),
                    upperThresholdLine= this.heatMap.selectAll("line.threshold.upper").data(this.upperThreshold, function (d) {return d;}),
                    HeatMapPlot= this;

                function placeOver(d) { return HeatMapPlot.yScale(d); }

                lowerThresholdLine.enter().append("line")
                    .call(this.horizontal, this, placeOver)
                    .classed("threshold lower", true);

                lowerThresholdLine.transition().duration(HeatMapPlot.durationTime)
                    .attr({"y1": placeOver,
                        "y2": placeOver});

                lowerThresholdLine.exit().remove();

                function placeUnder(d) { return HeatMapPlot.yScale(d) + HeatMapPlot.bucketHeight;}

                upperThresholdLine.enter().append("line")
                    .call(this.horizontal, this, placeUnder)
                    .classed("threshold upper", true);

                upperThresholdLine.transition().duration(HeatMapPlot.durationTime)
                    .attr({"y1": placeUnder,
                        "y2": placeUnder});

                upperThresholdLine.exit().remove();
            }

            function calcTimeLowerBound(time, length, size, span) {
                time = time.getTime();
                var date = time - (length / size) * span * 1000;
                return new Date(date);
            }

            function getTime(d) {
                return d._time;
            }

            function getMetaData(d) {
                return d._time + "," + d._span;
            }

            function toTime(t){
                var st= t.indexOf("=");
                return (t.substring(st+1))
            }

            function getBucketFromStr(str){
                var dash= str.indexOf("-");
                return [parseFloat(str.substring(0,dash)), parseFloat(str.substring(dash+1))];
            }

            function getBucket(d) {
                return d[0];
            }

            function getValue(d) {
                return d[1];
            }

            function isNum(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }

            function parseData(jString) {
                this.lowerThreshold= [];
                this.upperThreshold= [];
                var data= [];
                //sort data according to bucket values
                for(var col=0; col<jString.length; col++){
                    var tmp= [];
                    for(var bucket in jString[col]){
                        if(jString[col].hasOwnProperty(bucket) && bucket[0] !== "_"){
                            if (bucket[0] === "<"){
                                this.lowerThreshold.push(bucket);
                            }
                            else if (bucket[0] === ">"){
                                this.upperThreshold.push(bucket);
                            }
                            var tmpBucket= bucket;//=this.getBucketFromStr(bucket);
                            tmp.push([tmpBucket, parseFloat(jString[col][bucket])]);
                        }
                    }
                    tmp._time= new Date(jString[col]._time);
                    tmp._span= eval(jString[col]._span);
                    tmp._extent= d3.extent(tmp, this.getValue);
                    //var firstBucket= tmp[0][0];
                    tmp._bucketSpan= "None";//firstBucket[1]-firstBucket[0];
                    data.push(tmp);
                }
                return data;
            }

            // function getTimeRange() {
            //     return this.getContext().get("search").getTimeRange();
            // }

            //############################################################
            // Main Module Logic
            //############################################################

            

            this.gettingResults = false;

            heatMap= d3.select(svg_id).append("g")
                .attr("class","heatMap");
            heatMapStage=heatMap.append("g")
                .attr("class","heatMapStage");
            heatMap.append("g")
                .attr("class", "axis x");

            heatMap.append("g")
                .attr("class", "axis y");


            this.durationTime = 500;
            this.colorOffset= 1;
            this.colorRange= ["white","#CC0000"];

            this.colorScale= "log" === "linear" ?
                d3.scale.linear() :
                d3.scale.log();

            this.nDrilldownBuckets= 30;
            var that = this;

            this.requiredFields = [];
            console.log("INITIALIZE IS RUN");
            //Context flow gates
            this.doneUpstream = false;
            this.gettingResults = false;

            $("document").ready(function() {
                plot(data);
            });

            function drillDownOnYAxisField(d){
                var
                    // search = context.get("search"),
                    // timeRange = search.getTimeRange(),
                    // earliestTime = timeRange.getRelativeEarliestTime(),
                    // latestTime = timeRange.getRelativeLatestTime(),
                    colorDom= this.colorScale.domain(),
                    step= (colorDom[1]-colorDom[0]) / this.nDrilldownBuckets;
                this.setMetaData(earliestTime, latestTime, d, step.toFixed(2));
            }

            function getParam(str, defaultValue) {
                var value= this._params[str];
                return value ? value : defaultValue;
            }

            function parseMetaData(metaData){
                var pattern = /([^\(]+)/;
                var time = metaData.split(pattern);
                return time[1];
            }

            function parseFieldFromMetaData(metaData){
                var metaDataArray = metaData.split(";");
                return metaDataArray[1].toString();
            }

            function metaTimeToEpoch(metaData){
                var newDate = new Date(metaData.toString());
                return newDate.getTime()/1000.0;
            }

            function setRequiredFields(requiredFields){
                this.requiredFields = requiredFields;
            }

            function getRequiredFields(){
                return this.requiredFields;
            }

            // function setMetaData(epochStart, epochEnd, field, span){
            //     var context = this.getContext(),
            //         search = context.get("search");
            //     search.abandonJob();

            //     //Check is needed since some splunk modules define endTime as false or undefined in allTime searches
            //     if(typeof epochEnd === false || typeof epochEnd === undefined){
            //         console.log("epochEnd is false or undefined");
            //         epochEnd = new Date().getTime() / 1000;
            //         var searchRange = new Splunk.TimeRange(epochStart,epochEnd);
            //         search.setTimeRange(searchRange);
            //     }
            //     this.setRequiredFields([epochStart,epochEnd,field,span]);
            //     search.setRequiredFields(this.getRequiredFields());

            //     context.set("search", search);

            //     if(this.doneUpstream && !(this.gettingResults)){
            //         this.pushContextToChildren(context);
            //     }
            // }

            // getResults: function($super) {
            //     this.doneUpstream = true;
            //     this.gettingResults = true;
            //     return $super();
            // }

            // getResultParams: function($super) {
            //     var params = $super();
            //     var context = this.getContext();
            //     var search = context.get("search");
            //     var sid = search.job.getSearchId();

            //     if (!sid) this.logger.error(this.moduleType, "Assertion Failed.");

            //     params.sid = sid;
            //     return params;
            // }

            // renderResults: function($super, jString) {
            //     if (!jString || jString.toString().indexOf("<meta http-equiv=\"status\" content=\"400\" />") !== -1) {
            //         return;
            //     }
            //     if (jString.results === undefined){
            //         resultsDict = eval(jString);
            //     }else{
            //         resultsDict = jString.results;
            //     }
            //     var newSID= this.getSID();
            //     if ((this.sid) && (this.sid !== newSID)){
            //         this.clearPlot();
            //     }
            //     this.sid= newSID;

            //     var that= this;
            //     $("document").ready(function() {
            //         that.plot(resultsDict);
            //     });

            //     this.gettingResults = false;
            // }
        }
    });
    return HeatWave;
});
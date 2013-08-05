require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        "testapp/contrib/cal-heatmap/cal-heatmap": {
            deps: ["splunkjs/mvc/d3chart/d3/d3.v2"],
            exports: "cal"
        }
    }
});

// calheat!
// shows a cool looking heatmap based on different time signatures
// requires a timechart search. it dynamically guesses how to set up the
// way to show the time, but you can define any settings you want in the html
// docs: http://kamisama.github.io/cal-heatmap

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var cal = require("testapp/contrib/cal-heatmap/cal-heatmap");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!testapp/contrib/cal-heatmap/cal-heatmap.css");

    var calHeat = SimpleSplunkView.extend({

        className: "splunk-toolkit-cal-heatmap",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type

            options: {} // the default for custom heatmap options.
        },

        output_mode: "json",

        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
                formatTitle: function(d) {
                    return (d.source.name + ' -> ' + d.target.name +
                            ': ' + d.value); 
                }
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");

            // whenever domain or subdomain are changed, we will re-render.
            this.settings.on("change:domain", this._onDataChanged, this);
            this.settings.on("change:subdomain", this._onDataChanged, this);
        },

        createView: function() { 
            // for (var i=0; i<this.settings.get("maxSeries"); i++)
            //     this.$el.html("<button id='"+this.id+"-previous' class='btn' style='margin: 5px;'> Previous </button> <button id='"+this.id+"-next' class='btn' style='margin: 5px;'> Next </button>");
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var maxSeries = this.settings.get('maxSeries')+1;
            var myfields = this.resultsModel.data().fields
            myfields = _.first(myfields, maxSeries+1);
            for (var i=0; i<myfields.length; i++) {
                myfields[i] = _.pick(myfields[i], 'name');
                myfields[i] = _.values(myfields[i]);
            }
            myfields = _.without(_.flatten(myfields), "_time");
            var myresults = this.resultsModel.data().results 

            var domain = 'hour';
            var subdomain = 'min';

            if (data && data[0] != null) {
                if (parseInt(data[0]._span) > 60) {
                    domain = 'day';
                    subdomain = 'hour';
                }
                var formattedData = [];
                for(var i = 0; i < maxSeries; i++) {
                    formattedData.push({});
                }

                for(var i = 0; i < myresults.length; i++) {
                    var time = new Date(myresults[i]._time)
                    time = time.valueOf() / 1000
                    for(var j = 0; j < maxSeries; j++) {
                        var name = myfields[j];
                        var curObject = formattedData[j];
                        curObject[time] = myresults[i][name]
                    }
                }
                return {
                    timestamps: formattedData,
                    start: new Date(data[0]._time),
                    domain: domain,
                    subdomain: subdomain
                };
            }

            return null;
        },

        updateView: function(viz, data) {
            var that = this;
            userOptions = this.settings.get('options')
            var maxSeries = 3; //this.settings.get('maxSeries');
            var i = 0;

            this.$el.html('');
            console.log(data);
            // default options here.
            for (var i=0; i<maxSeries; i++) {
                $("<div class='buttons'> <button id='previous-"+i+"' class='btn' style='margin: 5px;'> Previous </button> <button id='next-"+i+"' class='btn' style='margin: 5px;'> Next </button></div>")
                    .appendTo(this.el)[0];
                options = _.extend({
                    itemSelector: $("<div class='floatleft'/>").appendTo(this.el)[0],
                    previousSelector: "#previous-"+i,
                    nextSelector: "#next-"+i,
                    data: data.timestamps[i],
                    domain: data.domain,
                    subdomain: data.subdomain,
                    start: data.start,
                    range: 4,
                    cellSize: 16,
                    cellPadding: 3,
                    domainGutter: 10,
                    highlight: ['now', new Date()],
                    legendMargin: [0, 0, 20, 0],
                    legendCellSize: 14,
                    onClick: function(date, value) { 
                        that.settings.set("value", date.valueOf());
                    },
                }, userOptions)        
                var cal = new CalHeatMap(); 
                
                cal.init(options); // create the calendar using either default or user defined options
            }  
        }
    });
    return calHeat;
});
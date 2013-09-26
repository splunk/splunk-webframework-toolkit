require.config({
    shim: {
       "splunk_wftoolkit/contrib/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        "splunk_wftoolkit/contrib/cal-heatmap/cal-heatmap": {
           deps: ["splunk_wftoolkit/contrib/d3chart/d3/d3.v2"],
            exports: "cal"
        }
    }
});

     // calheat!
// shows a cool looking heatmap based on different time signatures
// requires a timechart search. it dynamically guesses how to set up the
// way to show the time, but you can define any settings you want in the html
// docs: http://kamisama.github.io/cal-heatmap

// ---settings---

// domain: (hour, day, week, month, year)
// subdomain: (min, x_min, hour, x_hour, day, x_day, week, x_week, month, x_month)
//       -- x_ variants are used to rotate the reading order to left to right, then top to bottom.
// start: set to 'current' for current time or 'earliest' for your earliest data point
//       to define where you want the heatmap to show initially

// TODO:
// add a setting for each option at http://kamisama.github.io/cal-heatmap/#options
//      rather than using the JS method in the HTML like i'm doing now.



// the data is expected in this format after formatData (epoch time: event count): 
// {
//    "timestamps":[
//       {
//          "1378225500":"8",
//          "1378225560":"8",
//          "1378225620":"8",
//       },
//       {
//          "1378230300":"4",
//          "1378230360":"4",
//          "1378230660":"2"
//       },
//       {
//          "1378225500":"7",
//          "1378225560":"7",
//       },
//       {
//          "1378225500":"6",
//          "1378225560":"6",
//          "1378225620":"7",
//       },
//       {
//          "1378225500":"41",
//          "1378225560":"41",
//       },
//       {
//          "1378225500":"22",
//          "1378225560":"22",
//       }
//    ],

// -- we add this part onto the actual data --

//    "start":"2013-09-03T16:25:00.000Z",
//    "domain":"hour",
//    "subdomain":"min"
// }

 define(function(require, exports, module) {
 
    var _ = require('underscore');
    var d3 = require("splunk_wftoolkit/contrib/d3chart/d3/d3.v2");
    var cal = require("splunk_wftoolkit/contrib/cal-heatmap/cal-heatmap");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!splunk_wftoolkit/contrib/cal-heatmap/cal-heatmap.css");
    require("css!./calendarheatmap.css");

    var calHeat = SimpleSplunkView.extend({

        className: "splunk-toolkit-cal-heatmap",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type
            domain: 'hour', // the largest unit it will differentiate by in squares
            subdomain: 'min', // the smaller unit the calheat goes off of
            start: 'current', // which data point to start the display at

            options: {} // the default for custom heatmap options.
        },

        output_mode: "json_rows",

        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");

            // whenever domain or subdomain are changed, we will re-render.
            this.settings.on("change:domain", this._onDataChanged, this);
            this.settings.on("change:subdomain", this._onDataChanged, this);
            var uniqueID=Math.floor(Math.random()*1000001);
            this.settings.set("uID", uniqueID);
        },

        createView: function() { 
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        // in this case, it looks like this:
        // {timestamp1: count, timestamp2: count, ... }
        formatData: function(data) {              
            var rawFields = this.resultsModel.data().fields;
            var domain = this.settings.get('domain');
            var subdomain = this.settings.get('subdomain');
            
            var filteredFields = _.filter(rawFields, function(d){return d[0] !== "_" });
            var objects = _.map(data, function(row) {
                return _.object(rawFields, row);
            });
            console.log(objects);

            var series = [];
            for(var i = 0; i < filteredFields.length; i++) {
                series.push({ name: filteredFields[i], timestamps: {} });
            }
            
            _.each(objects, function(object) {
                // Get the timestamp for this object
                var time = new Date(object['_time']);
                var timeValue = time.valueOf() / 1000;
                
                // For each actual value, store it in the timestamp object
                for(var i = 0; i < filteredFields.length; i++) {
                    var value = object[filteredFields[i]];
                    series[i].timestamps[timeValue] = parseInt(value, 10);
                }
            });
            
            return {
                series: series,
                domain: domain,
                subdomain: subdomain,
                start: new Date(objects[0]['_time']),
                min: new Date(objects[0]['_time']),
                max: new Date(objects[objects.length - 1]['_time']),
            };
        },

        updateView: function(viz, data) {     
            userOptions = this.settings.get('options')
            
            this.$el.html('');
            
            var that = this;
            _.each(data.series, function(series, idx) {
                var $el = $("<div class='heatmap-container'/>").appendTo(that.el);
                var $title = $("<h4 class='heatmap-series-title'>Heatmap for: " + series.name + "</h4>").appendTo($el);
                var $buttons = $("<div class='heatmap-buttons'/>").appendTo($el);
                var $prev = $("<a class='heatmap-prev icon-arrow-left'></a>").appendTo($buttons);
                var $next = $("<a class='heatmap-next icon-arrow-right'></a>").appendTo($buttons);
                var options = _.extend({
                    itemSelector: $el[0],
                    previousSelector: $prev[0],
                    nextSelector: $next[0],
                    data: series.timestamps,
                    domain: data.domain,
                    subdomain: data.subdomain,
                    start: data.start,
                    range: 4,
                    cellSize: 12,
                    cellPadding: 3,
                    domainGutter: 10,
                    highlight: ['now', new Date()],
                    legendMargin: [0, 0, 20, 0],
                    legendCellSize: 14,
                    minDate: data.min,
                    maxDate: data.max,
                    onMinDomainReached: function(hit) {
                        $prev.attr("disabled", hit ? "disabled" : false);
                    },
                    onMaxDomainReached: function(hit) {
                        $next.attr("disabled", hit ? "disabled" : false);
                    },
                    onClick: function(date, value) { 
                        console.log("BOO", date, value);
                    },
                }, userOptions);
                
                var cal = new CalHeatMap();
                cal.init(options); // create the calendar using either default or user defined options */
                
                if (idx < data.series.length - 1) {
                    $("<hr/>").appendTo($el);
                }
            });
        }
    });
    return calHeat;
});
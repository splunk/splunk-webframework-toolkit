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
            
            var myfields = _.filter(rawFields, function(d){return d[0] !== "_" });
            var objects = _.map(data, function(row) {
                return _.object(rawFields, row);
            });

            if (objects && objects[0] != null) {
                var formattedData = {};

                for(var i = 0; i < objects.length; i++) {
                    var summed = 0;
                    var time = new Date(objects[i]._time)
                    time = time.valueOf() / 1000
                    for(var j=0; j<myfields.length; j++){
                        if (!isNaN(parseInt(objects[i][myfields[j]]))) {
                            summed += parseInt(objects[i][myfields[j]]);
                        }
                    formattedData[time] = summed;
                    }
                }

                var startOption = this.settings.get('start');

                if (startOption === 'earliest'){
                    var d = 0;
                    for (var first in formattedData){
                        d = first;
                        break;
                    }
                    var earliest = new Date(0); 
                    earliest.setUTCSeconds(d);

                    start = earliest;
                }
                else if (startOption === 'current') {
                    start = new Date(data[0]._time);
                }
                else {
                    start = startOption;
                }
                return {
                    timestamps: formattedData,
                    start: start,
                    domain: domain,
                    subdomain: subdomain
                };
            }

            return null;
        },

        updateView: function(viz, data) {
            var that = this;
            userOptions = this.settings.get('options')
            var i = 0;
            var uniqueID = this.settings.get('uID');


            this.$el.html('');
            $("<div class='cal-heatmap-buttons'> <button id='previous-cal-heatmap"+uniqueID+"' class='btn' style='margin: 5px;'> Previous </button> <button id='next-cal-heatmap"+uniqueID+"' class='btn' style='margin: 5px;'> Next </button></div>")
                .appendTo(this.el)[0];
            var options = _.extend({
                itemSelector: $("<div/>").appendTo(this.el)[0],
                previousSelector: "#previous-cal-heatmap"+uniqueID,
                nextSelector: "#next-cal-heatmap"+uniqueID,
                data: data.timestamps,
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
    });
    return calHeat;
});
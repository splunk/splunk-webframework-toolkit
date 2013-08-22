// require.config({
//     shim: {
//         "splunkjs/mvc/d3chart/d3/d3.v2": {
//             deps: [],
//             exports: "d3"
//         },
//         "testapp/contrib/d3.parcoords": {
//             deps: ["splunkjs/mvc/d3chart/d3/d3.v2"],
//             exports: "d3.parcoords"
//         }
//     }
// });

// calheat!
// shows a cool looking heatmap based on different time signatures
// requires a timechart search. it dynamically guesses how to set up the
// way to show the time, but you can define any settings you want in the html
// docs: http://kamisama.github.io/cal-heatmap

define(function(require, exports, module) {

    var _ = require('underscore');
    //var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    //var d3parcoords = require("testapp/contrib/d3.parcoords");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!testapp/contrib/d3.parcoords.css");

    var ParCoords = SimpleSplunkView.extend({

        className: "splunk-toolkit-parcoords",

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
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var field_list = _.pluck(this.resultsModel.data().fields, 'name');
            var datas = data;
            field_list = _.filter(_.flatten(field_list), function(d){return d[0] !== "_" });

            data = {
                'results': datas,
                'fields': field_list
            }
            return data;
        },

        updateView: function(viz, data) {
            this.$el.html('');
            var fields = data.fields;
            console.log(data)
            // data.results = _.filter(data.results, function(d){return d[0] !== "_" });
            console.log(data.results)
            // var el = $("<div id='"+this.id+"_ParallelCoords class=parcoords style='width:360px;height:150px'>").appendTo(this.el);
            // var parcoords = d3.parcoords()("#example")
            //   .data(data.results)
            //   .render()
            //   .createAxes();

            var colorgen = d3.scale.category20();
            var colors = {};
            _(data.results).chain()
                .pluck(fields[0])
                .uniq()
                .each(function(d,i) {
                    colors[d] = colorgen(i);
                });


            console.log(colors)
            var color = function(d) {return colors[d[fields[0]]]; };


            var pc_progressive = d3.parcoords()("#example")
                .data(data.results)
                .color(color)   
                .alpha(0.4)
                .margin({ top: 24, left: 150, bottom: 12, right: 0 })
                .mode("queue")
                .render()
                .brushable()  // enable brushing
                .interactive()  // command line mode

              pc_progressive.svg.selectAll("text")
                .style("font", "10px sans-serif");
                    }
    });
    return ParCoords;
});
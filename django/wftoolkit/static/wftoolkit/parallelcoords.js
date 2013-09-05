require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        "wftoolkit/contrib/d3.parcoords": {
            deps: ["splunkjs/mvc/d3chart/d3/d3.v2"],
            exports: "d3.parcoords"
        }
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
    var d3parcoords = require("wftoolkit/contrib/d3.parcoords");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!wftoolkit/contrib/d3.parcoords.css");

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
            this.$el.html(''); // clearing all prior junk from the view (eg. 'waiting for data...')
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
            debugger;
            console.log(data);
            return data;
        },

        updateView: function(viz, data) {
            this.$el.html('');
            var fields = data.fields;
            viz = $("<div style='width:800px;height:150px' id='"+this.id+"_parallelcoords' class='parcoords'>").appendTo(this.el);
            var colorgen = d3.scale.category20();
            var colors = {};
            _(data.results).chain()
                .pluck(fields[0])
                .uniq()
                .each(function(d,i) {
                    colors[d] = colorgen(i);
                });


            var color = function(d) {return colors[d[fields[0]]]; };


            var pc_progressive = d3.parcoords()('#' + this.id + '_parallelcoords')
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
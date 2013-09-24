require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        "wftoolkit/contrib/d3.parsets": {
            deps: ["splunkjs/mvc/d3chart/d3/d3.v2"],
            exports: "d3.parsets"
        },
    }
});

// parallel sets!
// a visualisation technique for multidimensional categorical data
// you can drag the vertical or horizontal axis independently and 
// watch as your data is represented in completely different ways

// --- settings ---
// none for the time being.
// TODO: add settings to choose which data goes where

// --- expected data format ---
// a splunk search like this: index=_internal sourcetype=splunkd_access | table method status

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var d3p = require('wftoolkit/contrib/d3.parsets');

    require("css!wftoolkit/parallelsets.css");

    var parallelSets = SimpleSplunkView.extend({

        className: "splunk-toolkit-parellel-sets",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type
        },

        output_mode: "json_rows",

        initialize: function() {
            _.extend(this.options, {
                formatName: _.identity,
            });
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");
        },

        createView: function() { 
            return true
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var fields = this.resultsModel.data().fields;
            var objects = _.map(data, function(row) {
                return _.object(fields, row);
            });

            return {
                'results': objects,
                'fields': fields
            }
        },

        updateView: function(viz, data) {
            this.$el.html('');
            // we can set viz ourselves since we're not using createView
            viz = $("<div id='"+this.id+"_scParallelSets' class=scParallelSetsContainer>").appendTo(this.el);
            this.div_id = '#'+viz.attr('id');
            this.div = d3.select(this.div_id);
            this.svg_id = '#'+this.id + '_svg';
            var fields = data.fields;

            d3.select(this.svg_id).remove();
            this.chart = d3p().dimensions(fields);
            this.vis = this.div.append("svg")
                .attr("width", this.chart.width())
                .attr("height", this.chart.height())
                .attr("id", this.svg_id);

            this.vis.datum(data.results).call(this.chart);

            t = this.vis.transition().duration(500);
            t.call(this.chart.tension(0.5));
        }
    });
    return parallelSets;
});
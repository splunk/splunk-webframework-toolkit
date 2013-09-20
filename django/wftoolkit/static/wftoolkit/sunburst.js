require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

define(function(require, exports, module) {

    var _ = require('underscore');
    var nester = require("wftoolkit/contrib/underscore-nest/underscore.nest");
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");  

    require("css!wftoolkit/sunburst.css");

    var Sunburst = SimpleSplunkView.extend({

        className: "splunk-toolkit-sunburst", 

        options: {
            managerid: null,  
            data: "preview", 

            // default values
            nameField: "sourcetype",
            valueField: "count",
            groupingField: "sourcetype"
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

            // TODO: enable push
            // TODO: wire up changes

            // Set up resize callback. The first argument is a this
            // pointer which gets passed into the callback event
            $(window).resize(this, _.debounce(this._handleResize, 20));
        },

        _handleResize: function(e){
            
            // e.data is the this pointer passed to the callback.
            // here it refers to this object and we call render()
            e.data.render();
        },

        createView: function() {
            // Here we wet up the initial view layout
            var margin = {top: 15, right: 15, bottom: 15, left: 15};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width());
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());

            this.$el.html("");

            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all")

            // The returned object gets passed to updateView as viz
            return { container: this.$el, svg: svg, margin: margin};
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var unicode = function(d) {return d;}
            var field_list = _.without(_.pluck(this.resultsModel.data().fields, 'name'), 'name');
            var dataresults = nester.nest(data, field_list)
           // dataresults['name']=("flare")

            data = {
                'results': dataresults,
                'fields': field_list
            }
            return data;
        },

        updateView: function(viz, data) {
            var that = this;
            var containerHeight = this.$el.height();
            var containerWidth = this.$el.width(); 

             // Clear svg
            var svg = $(viz.svg[0]);
            svg.empty();
            svg.height(containerHeight);
            svg.width(containerWidth);

            // Add the graph group as a child of the main svg
            var graphWidth = containerWidth - viz.margin.left - viz.margin.right
            var graphHeight = containerHeight - viz.margin.top - viz.margin.bottom;
            var graph = viz.svg
                .append("g")
                .attr("width", graphWidth)
                .attr("height", graphHeight)
                .attr("transform", "translate("  
                        + ((graphWidth/2) + viz.margin.left ) + ","  
                        + ((graphHeight/2) + viz.margin.top ) + ")");

            var radius = Math.min(graphWidth, graphHeight) / 2;
            
            var color = d3.scale.category20c();

            var x = d3.scale.linear()
                .range([0, 2 * Math.PI]);

            var y = d3.scale.linear()
                .range([0, radius]);

            var partition = d3.layout.partition()
                .value(function(d) { return d.size; });

            var arc = d3.svg.arc()
                .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
                .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
                .innerRadius(function(d) { return Math.max(0, y(d.y)); })
                .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

            var root = data.results;

            var g = graph.selectAll("g")
                .data(partition.nodes(root))
                .enter().append("g");

            var path = g.append("path")
                .attr("d", arc)
                .style("fill", function(d) {return color((d.children ? d : d.parent).name); })
                .on("click", click);

            var text = g.append("text")
                .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
                .attr("x", function(d) { return y(d.y); })
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(function(d) { return d.name; });

            function click(d) {
            // fade out all text elements
                text.transition().attr("opacity", 0);

                path.transition()
                  .duration(750)
                  .attrTween("d", arcTween(d))
                  .each("end", function(e, i) {
                      // check if the animated element's data e lies within the visible angle span given in d
                      if (e.x >= d.x && e.x < (d.x + d.dx)) {
                        // get a selection of the associated text element
                        var arcText = d3.select(this.parentNode).select("text");
                        // fade in the text element and recalculate positions
                        arcText.transition().duration(750)
                          .attr("opacity", 1)
                          .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                          .attr("x", function(d) { return y(d.y); });
                      }
                  });
            }

            // Interpolate the scales!
            function arcTween(d) {
              var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                  yd = d3.interpolate(y.domain(), [d.y, 1]),
                  yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
              return function(d, i) {
                return i
                    ? function(t) { return arc(d); }
                    : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
              };
            }

            function computeTextRotation(d) {
              return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
            }
                    
        }
    });
    return Sunburst;
});
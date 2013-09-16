require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
        /*"wftoolkit/contrib/underscore-nest/underscore.nest": {
            deps: ['underscore'],
            exports: "window.nest"
        }*/
    }
});

define(function(require, exports, module) {

    var _ = require('underscore');
    var nester = require("wftoolkit/contrib/underscore-nest/underscore.nest");
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    

    require("css!wftoolkit/sunburst.css");

    var Sunburst = SimpleSplunkView.extend({

        className: "splunk-toolkit-sunburst", // doesn't matter what this is called

        options: {
            mychartid: "search1",   // your MANAGER ID
            data: "preview",  // Results type

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

            this.svg_id = this.id + '_svg';
            this.width = 500;
            this.height = this.width;

            SimpleSplunkView.prototype.initialize.apply(this, arguments);
        },

        createView: function() {
            this.$el.html('');
            $("<div id="+this.id+"_sunburst class=SunBurstContainer>").appendTo(this.el);
        	return true;
	    },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var unicode = function(d) {return d;}
            var field_list = _.without(_.pluck(this.resultsModel.data().fields, 'name'), 'name');
            var dataresults = nester.nest(data, field_list)
            dataresults['name']=("flare")

            // alert(field_list)

            data = {
                'results': dataresults,
                'fields': field_list
            }
            return data;
        },

        updateView: function(viz, data) {
            var width = 960,
                height = 700,
                radius = Math.min(width, height) / 2;

            var x = d3.scale.linear()
                .range([0, 2 * Math.PI]);

            var y = d3.scale.linear()
                .range([0, radius]);

            var color = d3.scale.category20c();

            var svg = d3.select("#"+this.id).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

            var partition = d3.layout.partition()
                .value(function(d) { return d.max_size_kb; });

            var arc = d3.svg.arc()
                .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
                .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
                .innerRadius(function(d) { return Math.max(0, y(d.y)); })
                .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

            var root = data.results;

            var g = svg.selectAll("g")
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

            d3.select(self.frameElement).style("height", height + "px");

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
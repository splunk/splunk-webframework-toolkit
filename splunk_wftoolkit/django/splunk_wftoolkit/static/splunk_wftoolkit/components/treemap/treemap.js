define(function(require, exports, module) {

    var _ = require("underscore");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var d3 = require("../d3/d3");

    require("css!./treemap.css");

    // Returns jobids with values equal to the count of 
    // nodes running them
    function nodesPerJob(data) {
        var jobs = {};
        _.each(data, function(item) {
            if (jobs[item.jobid]) {
                jobs[item.jobid]++;
            }
            else {
                jobs[item.jobid] = 1;
            }
        });
        var jobsArray = [];
        _.each(_.keys(jobs), function(key){
            jobsArray.push( { name: key, value: jobs[key] } );
        });
        return {name: "Nodes per Job", children: jobsArray}
    }

    function prefixLabel(label, prefix) {
        var pre = prefix || 'jobid';
        return pre + ': ' + label;
    }

    function tooltipNameValue(d) {
        return 'jobid ' + d.name + ', ' + d.value + ' nodes';
    }

    var Treemap = SimpleSplunkView.extend({
        moduleId: module.id,

        className: "splunk-toolkit-treemap",

        options: {
            managerid: null,   
            data: "preview", 
            title: "",
            dataFormatter: null ,
            formatLabel: prefixLabel,
            formatTooltip: tooltipNameValue
        },

        output_mode: 'json',
        
        // This is how we extend the SimpleSplunkView's options value for
        // this object, so that these values are available when
        // SimpleSplunkView initializes.
        initialize: function() {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);
            
            this.settings.on("change", this.render, this);

            // defaulted to nodes per job
            this.formatData = this.settings.get('dataFormatter') || nodesPerJob;
 
            // Set up resize callback. 
            $(window).resize(_.debounce(_.bind(this._handleResize, this), 20));
        },

        _handleResize: function() {
            this.render();
        },

        // The object this method returns will be passed to the
        // updateView() method as the first argument, to be
        // manipulated according to the data and the visualization's
        // needs.
        createView: function() {
            var margin = {top: 0, right: 0, bottom: 0, left: 0};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width());
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());

            this.$el.html("");

            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all")

            return { svg: svg, margin: margin};
        },

        // Where the data and the visualization meet.  Both 'viz' and
        // 'data' are the data structures returned from their
        // respective construction methods, createView() above and
        // onData(), below.
        updateView: function(viz, data) {
            var that = this;
            var formatLabel = this.settings.get('formatLabel');
            var formatTooltip = this.settings.get('formatTooltip');

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
                .attr("transform", "translate(" + viz.margin.left + "," + viz.margin.top + ")");

            var tooltip = d3.select(this.el).append("div")
                .attr("class", "treemap-tooltip");

            var x = d3.scale.linear().range([0, graphWidth]);
            var y = d3.scale.linear().range([0, graphHeight]);
            //var color = d3.scale.category20c();
            color = d3.scale.quantize().domain([0, 10000]).range(["#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"])
            var node = root = data;

            var treemap = d3.layout.treemap()
                .round(false)
                .size([graphWidth, graphHeight])
                .sticky(true)
                .value(function(d) { return d.value; });

            var nodes = treemap.nodes(root)
                .filter(function(d) { return !d.children; });

            var cell = graph.selectAll("g")
                .data(nodes)
              .enter().append("svg:g")
                .attr("class", "cell")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });

            cell.append("svg:rect")
                .attr("width", function(d) { 
                    return d.dx - 1; })
                .attr("height", function(d) { return d.dy - 1; })
                .style("fill", function(d) { return color(d.parent.name); });

            cell.append("svg:text")
                .attr("x", function(d) { return d.dx / 2; })
                .attr("y", function(d) { return d.dy / 2; })
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return formatLabel(d.name) } )
                .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

            cell.on("mouseover", doMouseEnter);
            cell.on("mousemove", doMouseEnter);
            cell.on("mouseout", doMouseOut);

            d3.select(window).on("click", function() { zoom(root); });

            d3.select("select").on("change", function() {
              treemap.value(this.value == "size" ? size : count).nodes(root);
              zoom(node);
            });
            
            function size(d) {
              return d.value;
            }

            function count(d) {
              return 1;
            }

            function zoom(d) {
                var kx = graphWidth / d.dx, ky = graphHeight / d.dy;
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);

                var t = graph.selectAll("g.cell").transition()
                  .duration(d3.event.altKey ? 7500 : 750)
                  .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

                t.select("rect")
                  .attr("width", function(d) { return kx * d.dx - 1; })
                  .attr("height", function(d) { return ky * d.dy - 1; })

                t.select("text")
                  .attr("x", function(d) { return kx * d.dx / 2; })
                  .attr("y", function(d) { return ky * d.dy / 2; })
                  .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

                node = d;
                d3.event.stopPropagation();
            }

            // Tooltips
            function doMouseEnter(d){
                var text = formatTooltip(d);
                tooltip
                    .text(text)
                    .style("opacity", function(){
                        if(d.value !== undefined) { return 1; }
                        return 0;
                    })
                    .style("left", (d3.mouse(that.el)[0]) + "px")
                    .style("top", (d3.mouse(that.el)[1] - 37) + "px"); 
            }

            // More tooltips
            function doMouseOut(d){
                tooltip.style("opacity", 1e-6);
            }
        },

        /* formatData should be overriden by providing a formatting
         * function as the dataFormatter setting. It should return a tree
         * formatted as follows:
         *
         * {
         *     "name": "<name>",
         *     "children": [
         *         {"name": "<name>", "value": <value>},
         *         {"name": "<name>", "value": <value>},
         *         {"name": "<name>",
         *             "children": [
         *                 {"name": "<name>", "value": <value>},
         *                 {"name": "<name>", "value": <value>},
         *                 {"name": "<name>", "value": <value>}
         *             ]
         *         },
         *         {"name": "<name>", "value": <value>},
         *         {"name": "<name>", "value": <value>},
         *         {"name": "<name>", "value": <value>}
         *     ]
         * }
         */
        formatData: function(data) {

            return false;
        }
    });

    return Treemap;
});

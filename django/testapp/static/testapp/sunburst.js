require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

// Bubbles!
// This takes in three things: nameField, valueField, and groupingField(often the same as name)

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!wftoolkit/sunburst.css");

    var Sunburst = SimpleSplunkView.extend({

        className: "sunburstview", // doesn't matter what this is called

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

            this.settings.enablePush("value");

            this.settings.on("change:value", this._onDataChanged, this);
        },

        createView: function() {

            this.tooltip = $("<div/>").append("div")
                .attr("class", "sunburstTooltip")
                .attr("style", "opacity:"+1e-6);
            $("<div id="+this.id+"_sunburst class=SunBurstContainer>").appendTo(this.el);
        	return true;
	    },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var unicode = function(d) {return d;}
        	layer_field_list = this.settings.get("value");
            if (layer_field_list !== undefined){
                console.log(data);

                // the data to be returned
                var data_tree = []
                var children_list = []
                var cardinalValues = {}
                for (var i=0; i<layer_field_list.length; i++)
                    cardinalValues[layer_field_list[i]] = {}

                function find_new_children_list(val, old_children_list, fieldName){
                    var oclLength = 0
                    if (old_children_list !== undefined){
                        oclLength = old_children_list.length;
                    }
                    for (var i=0; i<oclLength; i++){
                        var child=old_children_list[i];
                        if (child['val'] == val)
                            return child['children'];
                    }

                    // nothing in old_children_list
                    old_children_list.push({'val':val, 'fieldName':fieldName, 'children':[]});
                    return old_children_list[oclLength]['children'];
                }

                for (var i=0; i<data.length; i++) {
                    var row = data[i];
                    children_list = data_tree;

                    for (var j=0; j<layer_field_list.length; j++){
                        var field = layer_field_list[j];

                        cardinalValues[field][unicode(row[field])] = 0;
                        children_list = find_new_children_list(unicode(row[field]), children_list, field);
                    }
                }

                for (var i=0; i<layer_field_list.length; i++){
                    var field = layer_field_list[i];
                    var setToList = _.toArray(cardinalValues[field])
                    cardinalValues[field] = setToList;
                }

                return ({
                    'results':data_tree,
                    'choices':layer_field_list,
                    'cardinalValues':cardinalValues
                })
            }
            
        },

        updateView: function(viz, data) {

            // console.log(data.choices.length);
            if (data.choices.length < 2)    return true;
                function fromSet(i, set){
                    return i % 4;
                };

                console.log(data);
                // this.width = 700;
                var fieldToOrdinal,
                fieldToColorMap,
                totalRings,
                i, 
                w = this.width,
                h = w,
                r = w / 2,
                x = d3.scale.linear().range([0, 2 * Math.PI]),
                y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, r]),
                p = 5,
                duration = 500,
                div, vis,
                partition, arc, nodes,
                breadcrumblist,
                textEnter, text, path,
                self = this,
                colors;

                $('#' + this.svg_id).remove();
                $('#breadcrumblist').remove();

                totalRings = Object.keys(data.cardinalValues).length;

                /* build dict with mapping from fields to ordinal functions */

                fieldToOrdinal = {};
                $.each(data.cardinalValues, function(field){
                    if (data.cardinalValues.hasOwnProperty(field)){
                        fieldToOrdinal[field] = d3.scale.ordinal();

                        fieldToOrdinal[field].domain(data.cardinalValues[field]
                            .sort(function (a, b){
                                var aVal = Number(a) || a,
                                    bVal = Number(b) || b;
                                return aVal < bVal ? 1 : -1;
                        }));

                        fieldToOrdinal[field].rangeBands([0, 0.99], 0.5);
                    }
                });
                // the +1 accounts for the events outer ring
                totalRings = Object.keys(fieldToOrdinal).length + 1;

                /* give each field a base color from which shades can be
                 * derived using ordinals */

                fieldToColorMap = {};

                /* The first number of each element is the hue value, the second is the saturation value (hsl color values) */
                colors = [[25 , 76], [220, 47], [3,36], [193, 63], [148, 71]];
                // colors = [];
                i = 0;
                // var base = [180,99,60];
                $.each(data.cardinalValues, function(k, field){
                    var colorIndex = fromSet(i, colors);
                    fieldToColorMap[k] = colors[colorIndex];
                    i++;
                });

                function color(d) {
                    var h,s,v,
                        index;

                    if (d.children === undefined || d.fieldName === undefined){
                        return '#fff';
                    }

                    if(d.depth > 0){
                        index = self.fromSet(d.depth-1, colors);
                        // console.log(colors[index]);
                        h = colors[index][0];
                    } else {
                        h = '#fff';
                    }

                    s = fieldToOrdinal[d.fieldName](d.value) * 1.3;
                    v = fieldToOrdinal[d.fieldName](d.value) * 0.25 + 0.7;
                    return d3.hsl(h,s,v);
                }

                /* end code to give each field distinct color values in order */

                div = d3.select('#' + this.id + '_sunburst');

                breadcrumblist = div.append("div")
                                    .attr('id', 'breadcrumblist')
                                    .attr('style', 'height:40px')
                                    .append('ol');

                viz = div.append("svg")
                    .attr("width", w + p * 2)
                    .attr("height", h + p * 2).attr("id", this.svg_id)
                    .append("g")
                    .attr("transform", "translate(" + (r + p) + "," + (r + p) + ")");
                vis = viz;

                // this provides the core circle+hierarchy layout
                partition = d3.layout.partition()
                    .sort(null)
                    .value(function(d) { 
                        return 5.8 - d.depth; 
                    });

                arc = d3.svg.arc()
                    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
                    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
                    .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
                    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

                function doMouseEnter(d){
                    console.log(d);
                    var text;
                    if(d.fieldName === undefined){
                        text = "Event: " + d.value;
                    } else {
                        text = d.fieldName+": " + d.value;
                    }
                    // self.tooltip
                    //     .text(text)
                    //     .style("opacity", function(){
                    //         if(d.value !== undefined) { return 1; }
                    //         return 0;
                    //     })
                    //     .style("left", (d3.event.pageX - 50) + "px")
                    //     .style("top", (d3.event.pageY - 50) + "px");

                    d3.selectAll("path")
                        .filter(function(e){
                            return d.val === e.val && d.fieldName === e.fieldName;
                        })
                            .style("stroke-width", 2);

                }

                function doMouseOut(d){
                    d3.selectAll("path")
                        .style("stroke-width", 1)
                        .style("stroke", "#8C8C8C");
                    // self.tooltip.style("opacity", 1e-6);
                }

                nodes = partition.nodes({children: data});
                path = vis.selectAll("path").data(nodes);
                path.enter().append("path")
                    .attr("id", function(d, i) { return "path-" + i; })
                    .attr("d", arc)
                    .attr("fill-rule", "evenodd")
                    .style("fill", color)
                    .style('fill-opacity', 1)
                    .on("click", click)
                    .on("mouseout", doMouseOut)
                    .on("mouseover", doMouseEnter)
                    .attr("title", function(d) { return d.value; });

                text = vis.selectAll("text").data(nodes);
                textEnter = text.enter().append("text")
                    .style("fill-opacity", 1)
                    .style("visibility", function(e) { return nodeIsTooSkinny(e) ? "hidden" : null;})
                    .style("fill", function(d) {
                        return "#000";
                    })
                    .attr("text-anchor", function(d) {
                        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                    })
                    // .attr('style', function(d){return (String(d.value).length > 9 ? "visibility:hidden" : null);})
                    .attr("dy", ".2em")
                    .attr("transform", function(d) {
                        var multiline = false,
                            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                            rotate = angle + (multiline ? - 0.5 : 0);
                        return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                    })
                    .on("click", click)
                    .on("mouseover", doMouseEnter)
                    .on("mouseout", doMouseOut);

                function fittedText(d, visibleRings){
                    var newR,
                        maxFit,
                        widthText,
                        text;
                    
                    if(d.depth){
                        widthText = d.value.length * 5;
                        // I think this is closer to log(n) but whatever
                        newR = r * (1 / (1.5*visibleRings));
                        maxFit = newR / 5; // each character is around 4-5 pixels

                        if(widthText > newR){
                            return d.value.substr(0,maxFit-2)+"..";
                        } else {
                            return d.value;
                        }
                    }
                    return "";
                }

                // These two generate multi-line text
                // for the outer most ring, we dont want multiline strings since we have limited space
                textEnter.append("tspan")
                    .attr("x", 0)
                    .text(function(d) {
                        return fittedText(d, totalRings + 1);
                    });

                textEnter.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1em")
                    .text(function(d) { 
                        if(d.depth && d.children !== undefined){
                            return d.value.split(" ")[1] || "";
                        }
                        return "";
                    });

                function click(d) {
                    var depth_of_current_rings,
                        canTraverse;

                    function makeBreadCrumbs(node, index){
                        // alert(node);
                        if (node || node.value === undefined){
                            return;
                        }
                        makeBreadCrumbs(node.parent, index +1);

                        if(index !== 0){
                            breadcrumblist.append('a')
                                .attr('class', 'breadcrumb')
                                .text(node.fieldName+' : '+node.value+ " » ").on("click", function(link){
                                    return click(node);
                                });
                        } else {
                            breadcrumblist.append('a')
                                .attr('class', 'breadcrumb')
                                .attr('style', 'color:#C00')
                                .text(node.fieldName+' : '+node.value+ " » ")
                                .on("click", function(link){
                                    return click(node);
                                });
                        }
                    }

                    if(d.value === undefined) {
                        depth_of_current_rings = d3.selectAll('.breadcrumb')[0].length;
                        if(depth_of_current_rings !== 0){
                            canTraverse = true;
                        } else {
                            canTraverse = false;
                        }
                    } else {
                        canTraverse = true;
                    }

                    if(canTraverse){
                        path.transition()
                            .duration(duration)
                            .attrTween("d", arcTween(d));

                        // console.log(vis.selectAll("text").selectAll("tspan"));
                        d3.selectAll('.breadcrumb').remove();
                        makeBreadCrumbs(d, 0);
                        depth_of_current_rings = d3.selectAll('.breadcrumb')[0].length;

                        // Somewhat of a hack as we rely on arcTween updating the scales.
                        text
                            .transition()
                            .duration(duration)
                            .attrTween("text-anchor", function(d) {
                                return function() {
                                    return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                                };
                            })
                            .attrTween("transform", function(d) {
                                var multiline = false;
                                return function() {
                                    var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                                        rotate = angle + (multiline ? - 0.5 : 0);
                                    return "rotate(" + rotate + ")translate(" + (y(d.y) + p) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                                };
                            })
                            .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
                            .each("end", function(d) {
                                d3.select(this).select('tspan').text(function(d){
                                    return fittedText(d, totalRings - depth_of_current_rings+1);                            
                                });
                                d3.select(this).style("visibility", function(e) {


                                    if (isParentOf(d, e)){
                                        if (nodeIsTooSkinny(e)){
                                            return "hidden";
                                        }
                                        return null;
                                    }else{
                                        if (nodeIsTooSkinny(e)){
                                            return "hidden";
                                        }
                                        return d3.select(this).style("visibility");
                                    }
                                })
                                    .transition()
                                    .duration(duration);
                            });
                    }

                        
                }
                    
                function nodeIsTooSkinny(e){ 
                    return (Math.max(0, Math.min(2 * Math.PI, x(e.x + e.dx))) - Math.max(0, Math.min(2 * Math.PI, x(e.x))) < 0.05);
                }

                function textIsTooBig(e, num_of_current_rings){
                    return String(e.value).length >= ((num_of_current_rings)*2)+1;
                }

                function isParentOf(p, c) {
                    if (p === c) { return true; }
                        if (p.children) {
                            return p.children.some(function(d) {
                                return isParentOf(d, c);
                        });
                    }
                    return false;
                }

                // Interpolate the scales!
                function arcTween(d) {
                    var my = maxY(d),
                        xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                        yd = d3.interpolate(y.domain(), [d.y, my]),
                        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, r]);

                    return function(d) {
                        return function(t) { 
                            x.domain(xd(t)); 
                            y.domain(yd(t)).range(yr(t)); 
                            return arc(d); 
                        };
                    };
                }

                function maxY(d) {
                    // return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
                    return 10;
                }

                // http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
                function brightness(rgb) {
                    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
                }
                    
            }
    });
    return Sunburst;
});
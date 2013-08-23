require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

// Force Directed Graphs!
// these require an input of (at least) 3 fields in the format
// 'stats count by field1 field2 field3'
//  the option 'groupKey' is what you want your items grouped by
// 

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!wftoolkit/forcedirected.css");

    var ForceDirected = SimpleSplunkView.extend({

        className: "forcedirectedview", // doesn't matter what this is called

        options: {
            mychartid: "search1",   // your MANAGER ID
            data: "preview",  // Results type

            // default values
            height: "600",
            width: "600",
            zoom: 'true',
            directional: 'true',
            count: 'count',
            charges: -80,
            gravity: 0.1,
            linkDistance: 80,
            firstField: 'myfields[0].name',
            secondField: 'myfields[1].name',
            groupKey: 'myfields[2].name'
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
            

            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.width = this.settings.get('width');
            this.height = this.width;

            // in the case that any options are changed, it will dynamically update
            // without having to refresh.
            this.settings.on("change:charges", this._onDataChanged, this);
            this.settings.on("change:gravity", this._onDataChanged, this);
            this.settings.on("change:linkDistance", this._onDataChanged, this);

        },

        createView: function() {
            this.$el.html(''); // clearing all prior junk from the view (eg. 'waiting for data...')
            return $("<div id="+this.id+"_forcedirected class=ForceDirectedContainer>").appendTo(this.el);
	    },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) { 
            names = []
            groupNames = {}
            groupCount = 0
            output = {'nodes': [], 'links': []} 
            var myfields = this.resultsModel.data().fields;
            var first = this.settings.get('firstField');
            var second = this.settings.get('secondField');
            var occurance = myfields[2].name;
            var group = this.settings.get('groupKey');
            
            var grouplookup = [];
            var groupFlag = false;

            for (var i=0; i<data.length; i++) {
                var row = data[i];
                linkSourceIndex = null 
                linkTargetIndex = null
                firstName = null
                secondName = null
                groupID = 0
                var groupTag = 0;
                grouplookup = _.keys(groupNames);
                console.log(grouplookup);


                if (row[group]) {
                    groupName = String(row[group])

                    for (var k=0; k<groupNames.length; k++)
                        if (groupNames[k] == groupName)
                            groupFlag = true;

                    if (groupFlag == false){
                        groupID = grouplookup.length-1;
                        if (groupID < 0) groupID = 0;
                        groupNames[groupName] = groupCount
                        groupCount += 1
                    } else
                        groupID = groupNames[groupName]
                }


                
                function fn (n, xn){
                    for (var i=0; i<n.length; i++)
                        if (n[i] == xn) return true;
                }

                if (first) {
                    firstName = String(row[first])
                    if (!fn(names, firstName)) {
                        names.push(firstName)
                        linkSourceIndex = (names.length - 1);
                        output['nodes'].push({'source': firstName, 'group': groupID})
                    } else
                        linkSourceIndex = names[firstName];
                }

                if (second) {
                    secondName = String(row[second])
                    if (!fn(names, secondName)){
                        names.push(secondName)
                        linkTargetIndex = (names.length-1);
                        output['nodes'].push({'source': secondName, 'group': groupID})
                    }
                    else
                        linkTargetIndex = names[secondName];
                }

                // A link is a connection between our two measured quantities
                // The number of occurances (provided via search) gives us the link strength
                if ((linkSourceIndex > -1) && (linkTargetIndex > -1) && (row[occurance] != null)){
                    // # The weight of a link is determined by how often the pair occurs
                    linkWeight = parseInt(String(row[occurance]))
                    output['links'].push({'source': linkSourceIndex, 'target': linkTargetIndex, 'value': linkWeight})
                }
            }

            console.log(_.keys(groupNames).length);

            output['groupNames'] = groupNames
            output['groupLookup'] = Object.keys(groupNames)

            return output;
            
        },

        updateView: function(viz, data){

            var that = this;
            console.log(data);
            ////////////////////////////////////////////////////////////////////////////

            // We provide these by default
            // in case the view lacks sliders
            // this.charge = -80;
            // this.gravity = .1;
            // this.linkDistance = 200;

            this.charge = this.settings.get('charges');
            this.gravity = this.settings.get('gravity');
            this.linkDistance = this.settings.get('linkDistance');

            // the div id that we will select later
            this.div_id = '#' + this.id + '_forcedirected';
            this.container = viz;

            // force and svg elements
            this.color = null;
            
            this.svg = null;

            // buttons and labels
            this.label = null;
            this.reset_button = null;
            this.text_input = null;

            this.zoomable = this.settings.get("zoom");
            this.isDirectional = stringToBool(this.settings.get("directional"));
            this.zoomFactor = 0.5;
      
            this.results_endpoint = 'results';

            this.status_message = $('#status', this.container);

            this.has_controls = false;
            this.ready_to_dispatch = false;

            this.groupNameLookup = data.groupLookup;            

            var r = 6
            var height = this.height
            var width = this.width - r,
            link, node, self=this, 
            svg, svgRoot;

            this.color = d3.scale.category20();

            this.force = d3.layout.force()
                             .gravity(self.gravity)
                             .charge(self.charge)
                             .linkDistance(self.linkDistance)
                             .size([width, height *= 9 / 10]);

            // Setup SVG
            svgRoot = d3.select(this.div_id).append("svg:svg")
                           .attr("width", width)
                           .attr("height", height)
                           .attr("pointer-events", "all");
            
            svg = svgRoot
                    .append("svg:g");

            this.tooltips = new Tooltips(svg);

            if(this.zoomable){
                initPanZoom(svgRoot);
            }

            this.svg = svg.append("svg:g");

            this.svg.style("opacity", 1e-6)
                .transition()
                  .duration(1000)
                  .style("opacity", 1);

            this.svg.append("svg:defs").selectAll("marker")
                .data(["arrowEnd"])
              .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
              .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

            console.log(data.links);
            link = this.svg.selectAll("line.link")
                    .data(data.links)
                    .enter().append('path')
                        .attr("class", "link")
                        .attr("marker-end", function(d) {
                            if(self.isDirectional){
                                return "url(#" + "arrowEnd" + ")";
                            }
                        })
                        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

            link.on('mouseover', function(d) {
                    d3.select(this).classed('linkHighlight', true);
                    openLinkTooltip(d); 
                }) 
                .on('mouseout', function(d) { 
                    d3.select(this).classed('linkHighlight', false);
                    self.tooltips.close(); 
                });

            node = this.svg.selectAll("circle.node")
                    .data(data.nodes)
                    .enter().append("svg:circle")
                        .attr("class", "node")
                        .attr("r", r - 1)
                        .style("fill", function(d) {
                            return self.color(d.group); 
                        })
                        .call(self.force.drag);

            node.append("title")
                .text(function(d) { return d.source; });

            node.on('click', function(d) { self.onNodeClick(d); })
                .on('mouseover', function(d) {
                    // console.log(d3.select(this));
                    
                    d3.select(this).classed('nodeHighlight', true);
                    openNodeTooltip(d); 
                })
                .on('mouseout', function(d) { 
                    d3.select(this).classed('nodeHighlight', false);
                    self.tooltips.close();
                });

            this.force.nodes(data.nodes)
                .links(data.links)
                    .on("tick", function() {
                        link.attr("d", function(d) {
                            var dx = d.target.x - d.source.x,
                                dy = d.target.y - d.source.y,
                                dr = Math.sqrt(dx * dx + dy * dy);
                            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                        });

                        node.attr("cx", function(d) { 
                                d.x = Math.max(r, Math.min(width - r, d.x));
                                return d.x;
                            })
                            .attr("cy", function(d) { 
                                d.y = Math.max(r, Math.min(height - r, d.y));
                                return d.y;
                            });

                    }).start();

            function stringToBool(x){
                if(x.toLowerCase() === 'true'){
                    return true;
                }
                return false;
            }

            // draggin'
            function initPanZoom(svg){
                var self = this;

                svg.on('mousedown.drag', function(){
                    svg.classed('panCursor', true);
                    // console.log('drag start');
                });

                svg.on('mouseup.drag', function(){
                    svg.classed('panCursor', false);
                    // console.log('drag stop');
                });

                svg.call(d3.behavior.zoom().on("zoom", function() { 
                    panZoom();
                }));
            }

            // zoomin'
            function panZoom() {
                svg.attr("transform",
                    "translate(" + d3.event.translate + ")"
                    + " scale(" + d3.event.scale + ")");        
            }

            function openNodeTooltip(d){
                var groupName;

                if(that.groupNameLookup !== undefined){
                    groupName = that.groupNameLookup[d.group];
                } else {
                    groupName = d.group;
                }

                that.tooltips.open('nodes', {
                    slots: {
                        val: d.source,
                        group: groupName    
                    },
                    swatch: that.color(d.group)
                });
            }

            function openLinkTooltip(d){
                var groupName;

                if(this.groupNameLookup !== undefined){
                    groupName = this.groupNameLookup[d.group];
                } else {
                    groupName = d.group;
                }

                that.tooltips.open('links', {
                    slots: {
                        source: d.source.source,
                        target: d.target.source    
                    }
                });
            }

            function getSafeVal(getobj, name) {
                var retVal; 
                if (getobj.hasOwnProperty(name) && getobj[name] !== null) {
                    retVal = getobj[name];
                } else {
                    retVal = name; 
                }
                return retVal;
            }

            function onNodeClick(d) {
                var context = this.getContext(),
                    form = context.get('form') || {};
                form[this.fields.field1] = d.source;
                form[this.fields.field2] = d.group;

                context.set('form', form);
                context.set('click', this.moduleId);
                this.passContextToParent(context);
            }

            function highlightNodes(val) {
                var self = this, groupName;
                if(val !== ' ' && val !== ''){
                    this.svg.selectAll('circle')
                        .filter(function (d, i) {
                            groupName = self.groupNameLookup[d.group];
                            if(d.source.indexOf(val) >= 0 || groupName.indexOf(val) >= 0){
                                d3.select(this).classed('highlight', true);
                            } else {
                                d3.select(this).classed('highlight', false);
                            }
                        });
                } else {
                    this.svg.selectAll('circle').classed('highlight', false);
                }
            }



            /////////////////////// formerly known as tooltips.js /////////////////////////////

            function Tooltips(svg){
                var tooltipTimer = null,
                    tooltipOpenCoords = {},
                    tooltipIsOpen = false,
                    tooltipContents,
                    $tooltipContainer,
                    isReady = false,
                    layouts;

                setup(svg, viz);

                function setup(svg, $container){
                    var self = this,
                        data = [0],
                        $nodeVal, $nodeGroup, $nodeContainer,
                        $linkSource, $linkTarget, $linkContainer;

                    $tooltipContainer = $("<div id='tooltipContainer'></div>");

                    $nodeContainer = $("<div class='nodeContainer'></div>");
                    $nodeVal = $("<div class='node-value tooltipRow'><span class='tooltipLabel'>Value: </span><span class='field1-val'></span></div>");
                    $nodeGroup = $("<div class='node-group tooltipRow'></div><div class='group-swatch'></div><div class='group-name'><span class='tooltipLabel'>Group: </span><span class='group-val'></span></div>");
                    $nodeContainer.append($nodeVal);
                    $nodeContainer.append($nodeGroup);
                    $tooltipContainer.append($nodeContainer);

                    $linkContainer = $("<div class='linkContainer'></div>");
                    $linkSource = $("<div class='source tooltipRow'><span class='tooltipLabel'>Source: </span><span class='source-val'></span></div>");
                    $linkTarget = $("<div class='target tooltipRow'><span class='tooltipLabel'>Target: </span><span class='target-val'></span></div>");
                    $linkContainer.append($linkSource);
                    $linkContainer.append($linkTarget);
                    $tooltipContainer.append($linkContainer);

                    $tooltipContainer.find('.group-swatch').hide();

                    $container.prepend($tooltipContainer);
                    $tooltipContainer.hide();

                    layouts = {
                        'nodes': {
                            "container": $nodeContainer,
                            "slots": {
                                "val": $nodeVal.find('.field1-val'),
                                "group": $nodeGroup.find('.group-val')
                            },
                            "swatch": $nodeContainer.find('.group-swatch')
                        },
                        'links': {
                            "container": $linkContainer,
                            "slots": {
                                "source": $linkSource.find('.source-val'),
                                "target": $linkTarget.find('.target-val')
                            }
                        }
                    };

                    console.log(layouts);

                    isReady = true;
                };

                function clearTooltips(){
                    if(isReady){
                        $.each(layouts, function(k, layout){
                            $.each(layout.slots, function(k, v){
                                // this isnt really neccesary because it's either hidden or shown with newly-replaced content
                                v.empty();
                            });
                            layout.container.hide();
                            if(layout.swatch !== undefined){
                                layout.swatch.hide();
                            }
                        });
                    }        
                }

                this.close = function(){
                    // return false;
                    var self = this,
                        dx, dy;

                    if(tooltipTimer !== null){
                        window.clearTimeout(tooltipTimer);
                    }

                    dx = Math.abs(tooltipOpenCoords.x - d3.event.x);
                    dy = Math.abs(tooltipOpenCoords.y - d3.event.y);

                    /*
                    only close the tooltip when the user has moved a certain distance away
                    this helps when an element is very small and the user might have 
                    difficulty keeping their mouse directly over it
                    */
                    if(dy > 50 || dx > 50){
                        tooltipIsOpen = false;    
                        tooltipTimer = window.setTimeout(function(){
                            $tooltipContainer.fadeOut(400);
                        }, 500);
                    }
                };

                this.open = function(layout, data){
                    tooltipIsOpen = true;
                    tooltipOpenCoords = {
                        x: d3.event.x,
                        y: d3.event.y
                    };
                    
                    clearTooltips();
                    $.each(data.slots, function(k, v){
                        layouts[layout]['slots'][k].append(v);
                    });
                    layouts[layout]['container'].show();
                    if(layouts[layout]['swatch'] !== undefined){
                        layouts[layout]['swatch'].show().css('background-color', data.swatch);
                    }
                    $tooltipContainer.fadeIn(400);
                };
            }
        }

    });
    return ForceDirected;
});
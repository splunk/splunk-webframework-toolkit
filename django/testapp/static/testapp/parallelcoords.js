require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        },
    }
});

// calheat!
// shows a cool looking heatmap based on different time signatures
// requires a timechart search. it dynamically guesses how to set up the
// way to show the time, but you can define any settings you want in the html
// docs: http://kamisama.github.io/cal-heatmap

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("splunkjs/mvc/d3chart/d3/d3.v2");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    require("css!testapp/parallelsets.css");

    var parallelCoords = SimpleSplunkView.extend({

        className: "splunk-toolkit-parellelcoords",

        options: {
            managerid: "search1",   // your MANAGER ID
            data: "preview",  // Results type
            namespace: 'results',
            maxEvents: 500,

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
            return true
        },

        // making the data look how we want it to for updateView to do its job
        // in this case, it looks like this:
        // [(one for each in maxSeries: {timestamp1: count, timestamp2: count, ... }]
        formatData: function(data) {
            var unicode = function(d) {return d;}
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
            this.namespace = this.settings.get('namespace');
            var selected_fields = [];
            var viz = $("<div id='"+this.id+"_scParallelCoordsCheckbox' class=scParallelCoordsCheckboxContainer>").appendTo(this.el);
            this.$container = viz;
            this.margin = [75, 50, 20, 50];
            this.width = $(window).width() - 300 - this.margin[1] - this.margin[3];
            this.height = 450 - this.margin[0] - this.margin[2];
            this.filter = $(this.container).append("<div>").addClass("filters");
            this.columns = [
                $("<div>").addClass("filtersCol1"), 
                $("<div>").addClass("filtersCol2"),
                $("<div>").addClass("filtersCol3")
            ];
            this.filter.append(this.columns[0], this.columns[1], this.columns[2]);

            console.log(this.filter)

            function getSelectedFields() {
                return this.selected_fields;
            }

            function setSelectedFields(val) {
                this.selected_fields = val;
            }

            function compare(a, b){
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }

            function isNumber(x){
                return !isNaN(Number(x));
            }

            // sets up the initial DOM elements
            function checkboxClick(e) {
                var $target = $(e.target),
                    field,
                    selected_fields = this.getSelectedFields(),
                    i;
                field = $target[0].id;
                i = $.inArray(field, selected_fields);
                if (i >= 0) {
                    selected_fields.splice(i, 1);
                } else {
                    selected_fields.push(field);
                    selected_fields.sort(this.compare);
                }
                this.setSelectedFields(selected_fields);
                this.pushData();
            }

            function initializeUi(fields){
                var self = this,
                    selected_fields = getSelectedFields(),
                    split = fields.length / 3,
                    numInCol=0,
                    currentCol = 0,
                    isSelected,
                    i,
                    $checkboxContainer,
                    $checkbox;

                if(split % 1 !== 0){
                    split++;
                }

                // checkboxes - list of fields to toggle visibility
                // if ($(this.$filter[0][0]).children().length === 0) {
                //     for (i = 0; i < fields.length; i++) {
                //         // console.log('field ', i, ' ', fields[i]);
                //         $checkbox = $('<input type="checkbox" id="' + fields[i]  + '"/>');
                //         isSelected = $.inArray(fields[i], selected_fields);
                //         if(isSelected > -1){
                //             $checkbox.prop('checked', 'checked');
                //         }

                //         $checkbox.bind('click', function(e){
                //             self.checkboxClick.call(self, e);
                //         });

                //         $checkboxContainer = $('<div>').text(fields[i])
                //             .addClass("checkboxContainer")
                //             .appendTo(this.$filter);
                //         $checkboxContainer.prepend($checkbox);

                //         if(numInCol > split){
                //             numInCol = 0;
                //             currentCol++;
                //         }
                            
                //         this.columns[0].append($checkboxContainer);
                //         numInCol++;
                //     }
                // }
                // this.setSelectedFields(selected_fields);
            }
            // data is passed as a list of objects representing splunk events as KV pairs:
            // [{"fieldname":"fieldval", ...}, ...]
            function getNumericFields(data) {
                var numericFields = [],
                    isNum = {},
                    i,
                    length;

                if (data.length === 0) { return numericFields; }
                for (i = 0, length = data.length; i < length; i++) {
                    $.each(data[i], function(fieldname){
                        if (!isNum.hasOwnProperty(fieldname) || isNum[fieldname]){
                            isNum[fieldname] = this.isNumber(data[i][fieldname]);                    
                        }
                    });
                }
                $.each(isNum, function(k){
                    if (isNum[k] && k[0] !== '_') { numericFields.push(k); }
                });
                
                return numericFields;
            }
            function enumerateFields(data){
                var self = this,
                    original = [], // the data before it was enumerated
                                   // this lets us use the original string values for the table
                    colVals = {}, // unqiue vals, per-column
                    colHighestEnum = {}; // highest enum per column
                                         // we could use number of keys per column (from colVals) but that is slow
                if (data.length === 0) { return original; }

                $.each(data, function(i, row){
                    original.push({}); // new row

                    $.each(row, function(k, v){
                        if(!self.isNumber(v)){
                            // init
                            if(!colVals.hasOwnProperty(k)){
                                colVals[k] = {};
                                original[k] = {};
                                colHighestEnum[k] = 0;
                            }

                            original[i][k] = v;

                            // this value is not unique - assign existing enumerated value
                            if(colVals[k].hasOwnProperty(v)){
                                row[k] = colVals[k][v];
                            } else {
                                // value is unique, make new enum
                                row[k] = colHighestEnum[k];
                                colVals[k][v] = colHighestEnum[k];
                                colHighestEnum[k]++;
                            }
                        }
                    });
                });

                return original;
            }
            function getUniqueFields(data){
                var fields = [],
                    unique = {},
                    i,
                    fieldname,
                    key,
                    length;
                if (data.length === 0) { return fields; }
                for (i = 0, length = data.length; i < length; i++) {
                    $.each(data[i], function(fieldname){
                        if (!unique.hasOwnProperty(fieldname) || unique[fieldname]){
                            unique[fieldname] = data[i][fieldname];                    
                        }
                    });
                }
                $.each(unique, function(k){
                    if (unique[key] && key[0] !== '_') { fields.push(key); }
                });

                return fields;
            }
            function getSingletonValuedFields(data, fields) {
                var singletonFields = {},
                    fieldValues = {},
                    _singletonFields = [];

                $.each(data, function(i, events) {
                    $.each(events, function(e){
                        if (!fieldValues.hasOwnProperty(e)) {
                            fieldValues[e] = events[e];
                            singletonFields[e] = true;
                        } else if (singletonFields[e] && fieldValues[e] !== events[e]) {
                            singletonFields[e] = false;
                        }
                    });
                });

                $.each(singletonFields, function(f){
                    if (singletonFields[f] && ($.inArray(f, fields) >= 0)) { 
                        _singletonFields.push(f);
                    }
                });

                return _singletonFields;
            }

            function getInterestingFields(data, keys) {
                var deselectedList = this.getSingletonValuedFields(data, keys),
                    i,
                    interestingList = [];

                for (i = 0; i < keys.length; i++) {
                    if ($.inArray(keys[i], deselectedList) < 0) {
                        interestingList.push(keys[i]);
                    }
                }

                return interestingList;
            }

            function onBeforeJobDispatched(search) {
                search.setMinimumStatusBuckets(300);
                search.setRequiredFields(['*']);
            }

            var fields = data.fields;
            fields = fields.slice(0, 15);
            initializeUi(fields);



            /////////////////////////////////////////////////////////////////


            function setBrushState(val) {
                this.brush_state = val;
            }

            function setHiddenRows(val) {
                this.hidden_rows = val;  
            }
    



            var that = this;
            this.$el.html('');
            viz = $("<div id='"+this.id+"_scParallelCoords' class=scParallelCoordsContainer>").appendTo(this.el);
            this.ACTIVE_FIELDS_KEY = 'active_fields';
            this.brush_state = {};
            this.is_job_done = false;
            this.foreground = null;
            this.HIDDEN_ROWS_KEY = 'hidden_rows';
            this.hidden_rows = [];
            this.margin = [75, 50, 20, 50];
            this.max_events = this.settings.get('maxEvents');
            this.namespace = this.settings.get('namespace');
            this.ready_flag = false;
            this.width = $(window).width() - 300 - this.margin[1] - this.margin[3];
            this.height = 450 - this.margin[0] - this.margin[2];
            this.row = null;
            this.svg = d3.select(viz.get(0)).append("svg")
                .attr("id", this.id + "_svg")
                .attr("width", this.width + this.margin[1] + this.margin[3])
                .attr("height", this.height + this.margin[0] + this.margin[2])
                .append("g").attr("transform", "translate(" + this.margin[3] + "," + this.margin[0] + ")");
                
            var fields = data.fields;
            var field = fields[0]


            function buildBrushes(fields, y, foreground, data){
                var self = this,
                    brush_state = that.brush_state

                function clearBrushState(colName, something){
                    delete brush_state[colName];
                    setBrushState(brush_state);
                }

                function filterOnBrush() {
                    var actives = fields.filter(function(p) { return !y[p].brush.empty(); }),
                        extents = actives.map(function(p) { return y[p].brush.extent(); });

                    // iterate over all the rows and filter the ones that do not contain the given range
                    foreground.classed("fade", function(row) {
                        return !actives.every(function(p, i) {
                            return extents[i][0] <= row[p] && row[p] <= extents[i][1];
                        });
                    });
                }

                function brushEnd(data){
                    filterOnBrush.call(this);

                    var filteredCols = fields.filter(function(p) { return !y[p].brush.empty(); }),
                        // range is an array: [0] = minimum, [1] = maximum
                        rangeByCol = filteredCols.map(function(p) { return y[p].brush.extent(); }),
                        num,
                        comparator = {},
                        hidden_rows = [];

                    $.each(filteredCols, function(col, colName){
                        brush_state[colName] = rangeByCol[col];
                    });
                    setBrushState(brush_state);

                    $.each(data, function(i, rowVal){
                        $.each(filteredCols, function(col, colName){
                            num = Number(rowVal[colName]);
                            if(isNaN(num) || num <= rangeByCol[col][0] || num >= rangeByCol[col][1]){
                                comparator[i] = true;
                            }
                        });
                    });

                    $.each(comparator, function(k, v){
                        hidden_rows.push(Number(k));
                    });
                    setHiddenRows(comparator);
                }

                fields.forEach(function(field) {    
                    y[field].brush = d3.svg.brush()
                        .y(y[field])
                        .on("brushstart", clearBrushState)
                        .on("brush", filterOnBrush)
                        .on("brushend", brushEnd);
                });

                $.each(brush_state, function(colName, range){
                    if(y.hasOwnProperty(colName)){
                        y[colName].brush.extent([range[0],range[1]]);
                    }
                });
            }

            var self = this,
                $container = $(this.container),
                data = data.results;
                width = this.width,
                height = this.height,
                x = d3.scale.ordinal().domain(fields).rangePoints([0, width]),
                y = {},
                line = d3.svg.line(),
                axis = d3.svg.axis().orient("left"),
                duration = 750,
                foreground = that.foreground;
                row = that.row;
                colfields = ["sourcetype"].concat(fields)
            var brush,
                g,
                i;

            function path(row) {
                return line(fields.map(function(field) {
                    var xVal = x(field),
                        numberField = Number(row[field]),
                        yVal,
                        range;

                    if (typeof numberField === "number" && !isNaN(numberField)) {
                        yVal = y[field](numberField);
                    } else {
                        range = d3.extent(data, function(q) {
                            return +q[field];
                        });
                        yVal = y[field](range[0]);
                    }
                    return [xVal, yVal];
                }));
            }
            // create scale and brush for each key
            console.log(data);
            fields.forEach(function(f) {
                y[f] = d3.scale.linear()
                    .domain(d3.extent(data, function(p, i) {
                        if (typeof p !== "undefined") {
                            var pd = Number(p[f]);
                            if (typeof pd === "number" && !isNaN(pd)) {
                                return +pd;
                            } else {
                                return;
                            }
                        }
                    }))
                    .range([height, 0]);
            });
            
            // must set up paths if this is the first time they are being rendered
            // build lines
            if ($container.find("path").length === 0) {
                duration = 0;
                foreground = this.svg.append("g")
                    .attr("class", "foreground")
                    .selectAll("path").data(data).enter().append("path")
                    .attr("d", path);
            } else {
                foreground.data(data)
                    .transition().duration(duration)
                    .attr("d", path);
            }

            buildBrushes(fields, y, foreground);
            
            // add group for each key
            g = this.svg.selectAll(".field")
               .data(fields).enter().append("g")
               .attr("class", "field");

            // add axis and title
            g.append("g").attr("class", "axis")
                .append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "start")
                    .attr("transform", "rotate(-45)")
                    .attr("y", -10);

            // add brush for each axis
            g.append("g").attr("class", "brush")
                .each(function(d) {
                    d3.select(this).call(y[d].brush); 
                })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);

            brush = this.svg.selectAll(".brush .resize.n, .brush .resize.s")
                .append("polyline")
                    .attr('points', '0,0,  10,-5, 15,-5, 15,5, 10,5')
                    .attr('class', 'grabber');

            // move in the axis
            this.svg.selectAll("g.field")
                .transition().duration(duration)
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

            this.svg.selectAll("g.axis").data(fields)
                .transition().duration(duration)
                .each(function(d) { d3.select(this).call(axis.scale(y[d])); });

            this.svg.selectAll("text.label").data(fields).text(String);

            // Remove stragglers
            this.svg.selectAll("g.field")
                .data(fields).exit().remove();

            // init brush
            this.svg.selectAll("g.brush").data(fields)
                .each(function(d) {
                    d3.select(this).call(y[d].brush);
                });

            // var self = this,
            //     $container = $(this.container),
            //     width = this.width,
            //     height = this.height,
            //     $new_row,
            //     x = d3.scale.ordinal().domain(data.fields).rangePoints([0, width]),
            //     y = {},
            //     line = d3.svg.line(),
            //     axis = d3.svg.axis().orient("left"),
            //     duration = 750,
            //     foreground = this.foreground;
            //     row = this.row,
            //     colfields = ["sourcetype"].concat(data.fields);
            // var brush,
            //     g,
            //     i;
            // var fields = data.fields;

            // var values = enumerateFields(data),
            //     keys = _.keys(fields);

            // // fields = fields.slice(0, 15);

            // function compare(a, b){
            //     return a.toLowerCase().localeCompare(b.toLowerCase());
            // }

            // function setReadyFlag() {
            //     this.ready_flag = true;
            // }

            // function clearReadyFlag() {
            //     this.ready_flag = false;
            // }

            // function getReadyFlag() {
            //     return this.ready_flag;
            // }

            // function getData() {
            //     return this.data;    
            // }
            
            // function setData(val) {
            //     this.data = val;
            // }

            // function getForeground() {
            //     return this.foreground;    
            // }
            
            // function setForeground(val) {
            //     this.foreground = val;
            // }

            // function getFields() {
            //     return this.fields;    
            // }

            // function setFields(val) {
            //     this.fields = val;  
            // }
            
            // function getHiddenRows() {
            //     return this.hidden_rows;    
            // }

            // function setHiddenRows(val) {
            //     this.hidden_rows = val;  
            // }
            
            // function getRow() {
            //     return this.row;    
            // }
            
            // function setRow(val) {
            //     this.row = val;
            // }
            
            // function getBrushState() {
            //     return this.brush_state;    
            // }
            
            // function setBrushState(val) {
            //     this.brush_state = val;
            // }

            // function toNum(x){
            //     if(typeof x === undefined) {return false;}
            //     return Number(x);
            // }

            // function  isNumber(x){
            //     return !isNaN(Number(x));
            // }

            // function enumerateFields(data){
            //     var self = this,
            //         original = [], // the data before it was enumerated
            //                        // this lets us use the original string values for the table
            //         colVals = {}, // unqiue vals, per-column
            //         colHighestEnum = {}; // highest enum per column
            //                              // we could use number of keys per column (from colVals) but that is slow
            //     if (data.length === 0) { return original; }

            //     /*
            //     colVals looks like this:
            //         colA: {
            //             val0: 0,
            //             val1: 1
            //         },
            //         colB: {
            //             valXYZ: 0,
            //             valABC: 1
            //         }
            //     */

            //     $.each(data, function(i, row){
            //         original.push({}); // new row

            //         $.each(row, function(k, v){
            //             if(!self.isNaN(v)){
            //                 // init
            //                 if(!colVals.hasOwnProperty(k)){
            //                     colVals[k] = {};
            //                     original[k] = {};
            //                     colHighestEnum[k] = 0;
            //                 }

            //                 original[i][k] = v;

            //                 // this value is not unique - assign existing enumerated value
            //                 if(colVals[k].hasOwnProperty(v)){
            //                     row[k] = colVals[k][v];
            //                 } else {
            //                     // value is unique, make new enum
            //                     row[k] = colHighestEnum[k];
            //                     colVals[k][v] = colHighestEnum[k];
            //                     colHighestEnum[k]++;
            //                 }
            //             }
            //         });
            //     });

            //     return original;
            // }

            // function path(row) {
            //     return line(fields.map(function(field) {
            //         var xVal = x(field),
            //             numberField = Number(row[field]),
            //             yVal,
            //             range;

            //         if (typeof numberField === "number" && !isNaN(numberField)) {
            //             yVal = y[field](numberField);
            //         } else {
            //             range = d3.extent(self.data, function(q) {
            //                 return +q[field];
            //             });
            //             yVal = y[field](range[0]);
            //         }
            //         return [xVal, yVal];
            //     }));
            // }

            // /* helper functions */
            // function dragstart(d) {
            //     i = fields.indexOf(d);
            // }

            // // broken
            // function maximizeBrush(brushes){
            //     brushes.selectAll('.extent')
            //         .attr('height', 355)
            //         .style('display', 'block');

            //     brushes.selectAll('.resize.s')
            //         .attr('transform','translate(0,355)')
            //         .style('display', 'block');

            //     brushes.selectAll('.resize.n')
            //         .style('display', 'block');

            //     brushes.data(data.fields)
            //         .each(function(d) {
            //             y[d].brush.extent([0,355]);
            //         });
            // }
            
            // function drag(d) {
            //     x.range()[i] = d3.event.x;
            //     fields.sort(function(a, b) {return x(a) - x(b); });
            //     g.attr("transform", function(d) {return "translate(" + x(d) + ")"; });
            //     foreground.attr("d", path);
            // }
            
            // function dragend(d) {
            //     x.domain(data.fields).rangePoints([0, width]);
            //     var t = d3.transition().duration(duration);
            //     t.selectAll(".field").attr("transform", function(d) {
            //         return "translate(" + x(d) + ")";
            //     });
            //     t.selectAll(".foreground path").attr("d", path);
            // }

            // // create scale and brush for each key
            // fields.forEach(function(field) {
            //     y[field] = d3.scale.linear()
            //         .domain(d3.extent(self.data, function(p, i) {
            //             if (typeof p !== "undefined") {
            //                 var pd = Number(p[field]);
            //                 if (typeof pd === "number"
            //                     && !isNaN(pd)) {
            //                     return +pd;
            //                 } else {
            //                     return;
            //                 }
            //             }   
            //         }))
            //         .range([height, 0]);
            // });
            
            // // must set up paths if this is the first time they are being rendered
            // // build lines
            // if ($container.find("path").length === 0) {
            //     duration = 0;
            //     foreground = this.svg.append("g")
            //         .attr("class", "foreground")
            //         .selectAll("path").data(data).enter().append("path")
            //         .attr("d", path);
            //     setForeground(foreground);
            // } else {
            //     foreground.data(data)
            //         .transition().duration(duration)
            //         .attr("d", path);
            //     this.setForeground(foreground);
            // }

            // buildBrushes(fields, y, foreground);
            
            // // add group for each key
            // g = this.svg.selectAll(".field")
            //    .data(data.fields).enter().append("g")
            //    .attr("class", "field");

            // // add axis and title
            // g.append("g").attr("class", "axis")
            //     .append("text")
            //         .attr("class", "label")
            //         .attr("text-anchor", "start")
            //         .attr("transform", "rotate(-45)")
            //         .attr("y", -10);

            // // add brush for each axis
            // g.append("g").attr("class", "brush")
            //     .each(function(d) {
            //         d3.select(this).call(y[d].brush); 
            //     })
            //     .selectAll("rect")
            //     .attr("x", -8)
            //     .attr("width", 16);

            // brush = this.svg.selectAll(".brush .resize.n, .brush .resize.s")
            //     .append("polyline")
            //         .attr('points', '0,0,  10,-5, 15,-5, 15,5, 10,5')
            //         .attr('class', 'grabber');

            // // move in the axis
            // this.svg.selectAll("g.field")
            //     .transition().duration(duration)
            //     .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

            // this.svg.selectAll("g.axis").data(data.fields)
            //     .transition().duration(duration)
            //     .each(function(d) { d3.select(this).call(axis.scale(y[d])); });

            // this.svg.selectAll("text.label").data(data.fields).text(String);

            // // Remove stragglers
            // this.svg.selectAll("g.field")
            //     .data(data.fields).exit().remove();

            // // init brush
            // this.svg.selectAll("g.brush").data(data.fields)
            //     .each(function(d) {
            //         d3.select(this).call(y[d].brush);
            //     });

            // function buildBrushes(fields, y, foreground){
            //     var self = this,
            //         brush_state = getBrushState(),
            //         data = getData();

            //     function clearBrushState(colName, something){
            //         delete brush_state[colName];
            //         self.setBrushState(brush_state);
            //     }

            //     function filterOnBrush() {
            //         var actives = fields.filter(function(p) { return !y[p].brush.empty(); }),
            //             extents = actives.map(function(p) { return y[p].brush.extent(); });

            //         // iterate over all the rows and filter the ones that do not contain the given range
            //         foreground.classed("fade", function(row) {
            //             return !actives.every(function(p, i) {
            //                 return extents[i][0] <= row[p] && row[p] <= extents[i][1];
            //             });
            //         });
            //     }

            //     function brushEnd(){
            //         filterOnBrush.call(this);

            //         var filteredCols = fields.filter(function(p) { return !y[p].brush.empty(); }),
            //             // range is an array: [0] = minimum, [1] = maximum
            //             rangeByCol = filteredCols.map(function(p) { return y[p].brush.extent(); }),
            //             num,
            //             comparator = {},
            //             hidden_rows = [];

            //         $.each(filteredCols, function(col, colName){
            //             brush_state[colName] = rangeByCol[col];
            //         });
            //         self.setBrushState(brush_state);

            //         $.each(data, function(i, rowVal){
            //             $.each(filteredCols, function(col, colName){
            //                 num = Number(rowVal[colName]);
            //                 if(isNaN(num) || num <= rangeByCol[col][0] || num >= rangeByCol[col][1]){
            //                     comparator[i] = true;
            //                 }
            //             });
            //         });

            //         $.each(comparator, function(k, v){
            //             hidden_rows.push(Number(k));
            //         });
            //         self.setHiddenRows(comparator);
            //         self.pushData();
            //     }

            //     // fields.forEach(function(field) {    
            //     //     y[field].brush = d3.svg.brush()
            //     //         .y(y[field])
            //     //         .on("brushstart", clearBrushState)
            //     //         .on("brush", filterOnBrush)
            //     //         .on("brushend", brushEnd);
            //     // });

            //     // $.each(brush_state, function(colName, range){
            //     //     if(y.hasOwnProperty(colName)){
            //     //         y[colName].brush.extent([range[0],range[1]]);
            //     //     }
            //     // });
            // }

        }
    });
    return parallelCoords;
});
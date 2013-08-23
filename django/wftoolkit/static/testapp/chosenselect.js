// ChosenSelect!
// Gets the fields of teh search you're running behind it and puts
// them into a nice little area to select them for a plugin that
// relies on selected fields (ie sunburst)

define(function(require, exports, module) {

    var _ = require('underscore');
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
    var chosen = require('splunkjs/mvc/chosen');

    require("css!wftoolkit/chosen.css");

    var ChosenSelect = SimpleSplunkView.extend({

        className: "selectview", // doesn't matter what this is called

        options: {
            mychartid: "search1",   // your MANAGER ID
            data: "preview",  // Results type

            // default values
            num_of_choices: 1000,
            minFields: 0,
            maxFields: 1000,
            width: 240
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
            this.settings.enablePush("value");
        },

        createView: function() {
            var viz = $("<select class='chzn-select' multiple/>").appendTo(this.el);
            var chosen = viz.chosen();
            // chosen.on('change', function(){ console.log('change happened', viz.val())})
            return viz;
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var fields = Object.keys(data[1]);
            return fields;
        },

        updateView: function(viz, data) {
            var that=this;
            viz.empty();

            var i;
            for(i = 0; i < data.length; i++){
                viz.append($("<option>").attr("value", data[i]).text(data[i]));
            }
            viz.trigger("liszt:updated");

            viz.chosen().on('change', function(){ 
                console.log('change happened', viz.val())
                that.settings.set("value", viz.val());
            })

            return;
        }

        });
        return ChosenSelect;
    });
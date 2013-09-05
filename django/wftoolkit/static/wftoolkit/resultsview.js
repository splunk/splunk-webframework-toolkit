define(function(require, exports, module) {

    var _ = require('underscore');
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    var ResultsViewer = SimpleSplunkView.extend({

        className: "splunk-toolkit-results-viewer",

        storedData: undefined,

        createView: function() {
            
            return true;
        },

        updateView: function(viz, data) {
            this.storedData = data;
            this.$el.html('');
            this.$el.append("<pre>" + JSON.stringify(data, undefined, 2) + "</pre>")
        },

        getData: function(){
            return this.storedData;
        }
    });
    return ResultsViewer;
});
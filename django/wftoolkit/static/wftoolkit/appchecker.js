define(function(require, exports, module) {
    // Load requirements
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var service = mvc.createService()
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    // Define the custom view class
    var AppChecker = SimpleSplunkView.extend({
        className: "appchecker",
        // Override the render function to make the view do something
        // In this example: print to the page and to the console
        render: function() {
            var appname = this.settings.get("appName")
            this.$el.html("appName is: "+ appname+"<br>");

            service.apps().fetch(function(err, apps) {
                if (err) {
                    this.$el.html("<p>There was an error retrieving the list of applications</p>");
                    console.log("There was an error retrieving the list of applications:", err);
                    done(err);
                    return;
                }
            
                var appList = apps.list();
                var hasApp = 0;
                for(var i = 0; i < appList.length; i++) {
                    var app = appList[i];
                    if (app.name == appname) {
                        hasApp = 1;
                    }
                }
                if (hasApp == 0) {
                    alert("This app requires the app '"+ appname+ "' to run. Continue at risk of the app malfunctioning or download the app for full functionality!");
                }
                done();
            });
            return this;
        }
    });
    return AppChecker;
});
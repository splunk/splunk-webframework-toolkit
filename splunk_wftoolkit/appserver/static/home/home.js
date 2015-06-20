
require.config({
    paths: {
        'waypoints': '../app/splunk_wftoolkit/contrib/waypoints',
        'waypoints-sticky': '../app/splunk_wftoolkit/contrib/waypoints-sticky'
    },
    
    shim: {
        'waypoints': {
            deps: ['jquery'],
            exports: 'waypoints'
        },
        'waypoints-sticky': {
            deps: ['jquery', 'waypoints'],
            exports: 'waypointsSticky'
        }
    }
});

require(['jquery', 'underscore', 'waypoints', 'waypoints-sticky'], function($, _, waypoint, waypointsSticky) {

    $('.section-nav').waypoint('sticky', {
        offset: -15
    });
    $(function(){

        var itemTemplate = '\
        <div class="toolkit-item">\
            <a class="item-link" href="<%= id %>">\
                <img class="item-thumb" src="<%= staticUrl %>/img/<%= id %>.png"/>\
                <div class="item-content">\
                    <h4><%= title %></h4>\
                    <p class="item-description"><%= description %></p>\
                    <p class="view-button">View</p>\
                </div>\
            </a>\
        </div>';

        function clearActiveButtons(){
            $('.active').removeClass('active');
        }

        // Set up smooth scrolling
        // taken from: http://stackoverflow.com/questions/7717527/jquery-smooth-scrolling-when-clicking-an-anchor-link
        $('a').click(function(){
            $('html, body').animate({
                scrollTop: $( $.attr(this, 'href') ).offset().top - 30
            }, 500);
            return false;
        });

        var staticUrl = '../../../en-US/static/app/splunk_wftoolkit/';
        $.getJSON(staticUrl + 'json/navinfo.json', function(navdata){
             var template = _.template( itemTemplate ); 
            _.each(navdata, function(item){
                var $sectionList = $('#' + (item['section'] || 'learnmore' ) + '-list');
                $sectionList.append( template(_.extend(item,{staticUrl: staticUrl})));
            });
            $('#basiccomponents').waypoint(function(dir){
                clearActiveButtons();
                if(dir === 'down') {
                    $('#basic-components-button').addClass('active');
                }
            });
            $('#basiccomponents-end').waypoint(function(dir){
                if (dir === 'up') {
                    clearActiveButtons();
                    $('#basic-components-button').addClass('active');
                }
            });
            $('#toolkitvisualizations').waypoint(function(dir){
                clearActiveButtons();
                $('#toolkit-visualizations-button').addClass('active');
            });
            $('#toolkitvisualizations-end').waypoint(function(dir){
                if (dir === 'up') {
                    clearActiveButtons();
                    $('#toolkit-visualizations-button').addClass('active');
                }
            });
            $('#examples').waypoint(function(dir){
                clearActiveButtons();
                $('#examples-button').addClass('active');
            });
            $('#examples-end').waypoint(function(dir){
                if (dir === 'up') {
                    clearActiveButtons();
                    $('#examples-button').addClass('active');
                }
            });
        })
        .fail(function(jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        })    
    });

});
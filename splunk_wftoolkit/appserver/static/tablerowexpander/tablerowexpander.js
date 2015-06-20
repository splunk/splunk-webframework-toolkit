require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView,
        ChartView
    ) {

        var tokens = mvc.Components.getInstance('default');

        new SearchManager({
            id: 'simplesearch1',
            search: 'index=_internal earliest=-5d latest=now | stats count by sourcetype,source,host | rangemap field=count low=0-100 elevated=101-1000 default=severe',
            cache: true,
            preview: true,
            autostart: true
        });

        var tableView1 = new TableView({
            id: 'table1',
            managerid: 'simplesearch1',
            el: $('#table1')
        }).render();

        var tableView2 = new TableView({
            id: 'table2',
            managerid: 'simplesearch1',
            el: $('#table2')
        }).render();

        /*
        * Build query for master-detail views.
        */
        var buildQuery = function(rowData) {
            return 'index=_internal earliest=-5d latest=now ' +
                'sourcetype="' + rowData.values[0] + '" ' +
                'source="' + rowData.values[1] + '" ' + 
                'host="' + rowData.values[2] + '" ' + 
                '| timechart span=1d count | sort _time desc';
        }
     
        /*
        * Example 1
        */
 
        /*
        * SearchBasedRowExpansionRenderer implementation.
        */
        var SearchBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
            initialize: function(args) {
                if (!args.templateSelector && !args.template) {
                    throw new Error('template or templateSelector should be set.');
                }
 
                if (!args.queryBuilder) {
                    throw new Error('queryBuilder should be set.');
                }
 
                var that = this;
 
                that._template = _.template(args.template || $(args.templateSelector).html());
                that._queryBuilder = args.queryBuilder;
 
                // Because only one row can be expanded at a time we can
                // reuse SearchManager and deferred object for all rows.
                that._deferred = null;
 
                that._searchManager = new SearchManager({
                    id: 'example1-details-search-manager',
                    preview: false
                });
                that._searchManager.data('results', {count: 0, output_mode: 'json'})
                    .on('data', function(results) {
                        if (that._deferred) {
                            var results = results.hasData() ? results.data().results : null;
                            that._deferred.resolve(results);
                        }
                });
            },
 
            canRender: function(rowData) {
                return true;
            },
     
            render: function($container, rowData) {
                var that = this;
 
                $container.append('<div class="text-center">Waiting for data...</div>');
 
                that._deferred = new $.Deferred();
 
                that._deferred.done(function(result) {
                    $container.html(that._template(result));
                    that._deferred = null;
                });
 
                that._deferred.fail(function(error) {
                    // If deferred object is null - this means that job was canceled.
                    if (that._deferred) {
                        $container.text(JSON.stringify(error));
                        that._deferred = null;
                    }
                });
 
                that._searchManager.set({ search: that._queryBuilder(rowData) });
            },
 
            teardown: function($container, rowData) {
                var deferred = this._deferred;
                if (deferred) {
                    // Let's set deferred to null - this flag means that job canceled.
                    this._deferred = null;
                    // If deferred object is not done yet - let's reject it.
                    if (deferred.state() === 'pending') {
                        deferred.reject();
                        this._searchManager.cancel();
                    }
                }
            }
        });
 
        // Add SearchBasedRowExpansionRenderer to example1.
        var table1RowExpansionRenderer = new SearchBasedRowExpansionRenderer({
            template: '\
              <div>\
                  <strong>Statistics for the last 5 days</strong>\
                  <ul class="unstyled">\
                      <% _.each(obj, function(stat) { %> <li><%= (new Date(stat._time)).toLocaleDateString() %> - <%= stat.count %></li> <% }); %>\
                  </ul>\
              </div>',
            queryBuilder: buildQuery
        });
        tableView1.addRowExpansionRenderer(table1RowExpansionRenderer);
        tableView1.render();
 
        /*
        * Example 2
        */
 
        /*
        * GraphBasedRowExpansionRenderer implementation.
        */
        var GraphBasedRowExpansionRenderer = TableView.BaseRowExpansionRenderer.extend({
            initialize: function(args) {
                if (!args.queryBuilder) {
                    throw new Error('queryBuilder should be set.');
                }
 
                this._queryBuilder = args.queryBuilder;
 
                this._searchManager = new SearchManager({
                    id: 'example2-details-search-manager'
                });
 
                this._el = $('<div />');
                this._chart = new ChartView({
                    id: 'example2-details-chart',
                    managerid: 'example2-details-search-manager',
                    type: 'line',
                    el: this._el
                }).render();
            },
 
            canRender: function(rowData) {
                return true;
            },
 
            render: function($container, rowData) {
                this._el.appendTo($container);
                this._searchManager.set({ search: this._queryBuilder(rowData) });
            },
 
            teardown: function($container, rowData, loadedData) {
                this._el.detach();
                this._searchManager.cancel();
            }
        });
 
        tableView2.addRowExpansionRenderer(new GraphBasedRowExpansionRenderer({
            queryBuilder: buildQuery
        }));
        tableView2.render();
    }
);
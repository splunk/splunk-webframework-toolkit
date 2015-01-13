define([
    'jquery', 
    'underscore', 
    'prettify', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/sankey/sankeyCodeSample.txt',
    'text!splunk_wftoolkit/sankey/sankeyUsage.html',
    'splunkjs/mvc/searchmanager',
    'splunk_wftoolkit/components/sankey/sankey'
    ], 
    function(
        $, 
        _, 
        prettyPrint,
        mvc,
        VizTemplate,
        CodeSample,
        Usage,
        SearchManager,
        SankeyChart
    ) {
        return {
            render: function() {
                var pageContent = _.template(
                    VizTemplate, 
                    {
                        heading: 'Sankey Chart', 
                        usage: Usage, 
                        codesample: CodeSample
                    }
                );
                $('#wide-content').append(pageContent);
                prettyPrint();  

                new SearchManager({
                    id: 'sankey-search',
                    search: '| inputlookup faa.demo.csv | search DestCityName=* OriginCityName=* AND DestCityName!="" AND OriginCityName!="" | head 100 | stats count by OriginCityName DestCityName'
                });

                new SankeyChart({
                    id: 'sankey-chart',
                    managerid: 'sankey-search',
                    el: $('#example')
                }).render();
            }
        }
    }
);
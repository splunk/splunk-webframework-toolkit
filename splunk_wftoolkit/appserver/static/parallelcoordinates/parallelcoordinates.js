require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/parallelcoordinates/sample.txt',
    'text!splunk_wftoolkit/parallelcoordinates/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/parallelcoords/parallelcoords'
    ], 
    function(
        $, 
        _, 
        mvc,
        VizTemplate,
        CodeSample,
        Usage,
        SearchManager,
        DropdownView,
        ParallelCoordinates
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Parallel Coordinates', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup faa.demo.csv | search DestCityName="*, NY" OR DestCityName="*, CA" OR DestCityName="*, GA" OriginCityName="Seattle, WA" OR OriginCityName="San FranCisco, CA" OR OriginCityName="New York, NY" AirlineDescription=*| head 10000 | fields AirlineDescription OriginCityName DestCityName'
        });

        var pc = new ParallelCoordinates({
            id: 'pc',
            managerid: 'search1',
            el: $('#example')
        }).render();

        pc.on("select", function(e) {
            console.log("SELECT EVENT");
            _.each(e.selected, function(path) {
                console.log(_.values(path).join(' -> '));
            });
        });   
    }
);
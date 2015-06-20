require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/parallelsets/sample.txt',
    'text!splunk_wftoolkit/parallelsets/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/parallelsets/parallelsets'
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
        ParallelSets
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Parallel Sets', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup faa.demo.csv | search OriginCityName="*, CA" DestState=* | head 40 | table AirlineDescription, OriginCityName, DestCityName'
        });

        var sets = new ParallelSets({
            id: 'example-sets',
            managerid: 'search1',
            el: $('#example')
        }).render();

        var tensiondd = new DropdownView({
            id: 'tension-dropdown',
            default: '0.5',
            el: $('#tension-dropdown')
        }).render();
        var tensionChoices = [
                        {label: "0", value: "0"},
                        {label: ".25", value: "0.25"},
                        {label: ".5", value: "0.5"},
                        {label: ".75", value: "0.75"},
                        {label: "1", value: "1"},
                    ];
        tensiondd.settings.set("choices", tensionChoices);
        tensiondd.on("change", function(){
            sets.settings.set("tension", tensiondd.val());
        });

        sets.on("sort:categories", function(e){
            console.log("SORT");               
        });   
        
        sets.on("click", function(e) { 
            console.log("CLICK", e);
        });
    }
);
require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/forcedirectedgraph/codesample.txt',
    'text!splunk_wftoolkit/forcedirectedgraph/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunkjs/mvc/checkboxview',
    'splunkjs/mvc/textinputview',
    'splunk_wftoolkit/components/forcedirected/forcedirected'
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
        CheckboxView,
        TextInputView,
        ForceDirectedGraph
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Force Directed Graph', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup faa.demo.csv | search OriginCityName=* DestCityName=* DestStateName=* AND NOT OriginCityName="" AND NOT DestCityName="" AND NOT DestStateName="" | head 200 | stats count by OriginCityName, DestCityName, DestStateName | sort count'
        });

        var force = new ForceDirectedGraph({
            id: 'force-directed',
            managerid: 'search1',
            el: $('#example')
        }).render();

        var zoomcb = new CheckboxView({
            id: 'zoom-cb',
            default: true,
            el: $('#zoom-cb')
        }).render();

        var directionalcb = new CheckboxView({
            id: 'directional-cb',
            default: true,
            el: $('#directional-cb')
        }).render();

        var swoopcb = new CheckboxView({
            id: 'swoop-cb',
            default: false,
            el: $('#swoop-cb')
        }).render();

        var isStaticcb = new CheckboxView({
            id: 'isStatic-cb',
            default: true,
            el: $('#isStatic-cb')
        }).render();

        var chargetb = new TextInputView({
            id: 'charge-tb',
            default: '-500',
            el: $('#charge-tb')
        }).render();

        var gravitytb = new TextInputView({
            id: 'gravity-tb',
            default: '0.2',
            el: $('#gravity-tb')
        }).render();

        var linktb = new TextInputView({
            id: 'link-tb',
            default: '15',
            el: $('#link-tb')
        }).render();

        // Checkboxes
        directionalcb.on("change", function(){
            force.settings.set("directional", directionalcb.val());
        });
        zoomcb.on("change", function(){
            force.settings.set("panAndZoom", zoomcb.val());
        });
        swoopcb.on("change", function(){
            force.settings.set("swoop", swoopcb.val());
        });
        isStaticcb.on("change", function(){
            force.settings.set("isStatic", isStaticcb.val());
        });

        // Textboxes
        var errorMsg = "Enter a number"
        linktb.on("change", function(){
            checkTextInput(linktb, "linkDistance");
        });
        gravitytb.on("change", function(){
            checkTextInput(gravitytb, "gravity");
        });
        chargetb.on("change", function(){
            checkTextInput(chargetb, "charges");
        });

        // Texbox validator
        function checkTextInput(tb, setting){
            var numberValue = parseFloat(tb.val());
            if(numberValue){
                force.settings.set(setting, numberValue);
            }
            else{
                tb.val("Enter a number")
            }
        }       
        
        force.on("click:link", function(e) {
            console.log("LINK CLICK", e);
        });   
        
        force.on("click:node", function(e) {
            console.log("NODE CLICK", e);
        });
    }
);
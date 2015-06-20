require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/calendarheatmap/codesample.txt',
    'text!splunk_wftoolkit/calendarheatmap/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/calendarheatmap/calendarheatmap'
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
        CalendarHeatmap
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Calendar Heatmap', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: 'index=_internal sourcetype=splunkd_access | head 2000 | timechart span=1m count by status'
        });

        var heat = new CalendarHeatmap({
            id: 'myheat',
            managerid: 'search1',
            domain: 'hour',
            subDomain: 'min',
            el: $('#example')
        }).render();

        var domaindd = new DropdownView({
            id: 'domain-dropdown',
            default: 'hour',
            el: $('#domain-dropdown')
        }).render();

        var subDomaindd = new DropdownView({
            id: 'subDomain-dropdown',
            default: 'min',
            el: $('#subDomain-dropdown')
        }).render();

        var domainLabelFormatdd = new DropdownView({
            id: 'domainLabelFormat-dropdown',
            default: null,
            el: $('#domainLabelFormat-dropdown')
        }).render();

        heat.settings.set({ 
            range: 5
        });

        domainChoices = [
            {label: "hour", value: "hour"},
            {label: "day", value: "day"},
            {label: "week", value: "week"},
            {label: "month", value: "month"},
            {label: "year", value: "year"},
        ];
        domaindd.settings.set("choices", domainChoices);
        domaindd.on("change", function(){
            heat.settings.set("domain", domaindd.val());
        });

        subDomainChoices = [
            {label: "min", value: "min"},
            {label: "hour", value: "hour"},
            {label: "day", value: "day"},
            {label: "week", value: "week"},
            {label: "month", value: "month"},
            {label: "x_min", value: "x_min"},
            {label: "x_hour", value: "x_hour"},
            {label: "x_day", value: "x_day"},
            {label: "x_week", value: "x_week"},
            {label: "x_month", value: "x_month"}
        ];
        subDomaindd.settings.set("choices", subDomainChoices);
        subDomaindd.on("change", function(){
            heat.settings.set("subDomain", subDomaindd.val());
        });

        domainLabelFormatChoices = [
            {label: "(default)", value: ""},
            {label: "ISO-8601", value: "%Y-%m-%dT%H:%M:%S.%LZ"},
            {label: "MM/DD/YY", value: "%m/%e/%Y"},
            {label: "YY/MM/DD", value: "%Y/%m/%e"},
            {label: "HH:MM:SS", value: "%H:%M:%S"},
            {label: "HH:MM:SS AP", value: "%I:%M:%S %p"}
        ];
        domainLabelFormatdd.settings.set("choices", domainLabelFormatChoices);
        // Internally, the calendareheatmap tool uses the Javascript
        // 'null' value to set defaults.  Dropdown only understands 
        // the empty string.  This makes Dropdown's apparent setting 
        // match the tool's expected setting.
        domainLabelFormatdd.val("");
        domainLabelFormatdd.on("change", function(){
            heat.settings.set("domainLabelFormat", domainLabelFormatdd.val())
        });

        heat.on("click", function(e){console.log("Event:", e);});
    }
);
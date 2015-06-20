require([
    'jquery', 
    'underscore', 
    'prettify', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/radiogroupview',
    'splunkjs/mvc/dropdownview',
    'splunkjs/mvc/multidropdownview',
    'splunkjs/mvc/textinputview',
    'splunkjs/mvc/checkboxview',
    'splunkjs/mvc/checkboxgroupview',
    'splunkjs/mvc/singleview',
    ], 
    function(
        $, 
        _, 
        prettyPrint,
        mvc,
        SearchManager,
        RadioGroupView,
        DropdownView,
        MultiDropdownView,
        TextInputView,
        CheckboxView,
        CheckboxGroupView,
        SingleView
    ) {

        new SearchManager({
            id: 'example-single-search',
            search: 'index=_internal | stats count | rangemap field=count low=0-3 elevated=3-6 severe=6-10 default=severe',
            earliest_time: '-15m',
            latest_time: 'now'
        });

        new SearchManager({
            id: 'indexes-search',
            search: '| eventcount summarize=false index=* index=_* | dedup index | fields index | head 5 | head 5'
        });
        
        new RadioGroupView({
            id: 'example-radiogroup',
            default: 'One',
            el: $('#example-radiogroup')
        }).render();

        new RadioGroupView({
            id: 'example-radiogroup2',
            managerid: 'indexes-search',
            labelField: 'index',
            valueField: 'index',
            el: $('#example-radiogroup2')
        }).render();

        new DropdownView({
            id: 'example-dropdown',
            default: 'One',
            el: $('#example-dropdown')
        }).render();

        new DropdownView({
            id: 'example-dropdown1',
            managerid: 'indexes-search',
            valueField: 'index',
            el: $('#example-dropdown1')
        }).render();

        new MultiDropdownView({
            id: 'example-multidropdown',
            default: 'One',
            el: $('#example-multidropdown')
        }).render();

        new MultiDropdownView({
            id: 'example-multidropdown2',
            managerid: 'indexes-search',
            valueField: 'index',
            el: $('#example-multidropdown2')
        }).render();

        new TextInputView({
            id: 'example-textinput1',
            default: 'type here',
            el: $('#example-textinput1')
        }).render();

        new TextInputView({
            id: 'example-textinput2',
            default: 'to be replaced',
            el: $('#example-textinput2')
        }).render();

        new TextInputView({
            id: 'example-passwordinput1',
            default: '',
            type: 'password',
            el: $('#example-passwordinput1')
        }).render();

        new TextInputView({
            id: 'example-textinput3',
            default: 'to be replaced',
            el: $('#example-textinput3')
        }).render();

        new CheckboxView({
            id: 'example-checkbox',
            default: '',
            el: $('#example-checkbox')
        }).render();

        new CheckboxGroupView({
            id: 'example-checkboxgroup',
            default: 'One',
            el: $('#example-checkboxgroup')
        }).render();

        new CheckboxGroupView({
            id: 'example-checkboxgroup2',
            managerid: 'indexes-search',
            labelField: 'index',
            valueField: 'index',
            el: $('#example-checkboxgroup2')
        }).render();

        new SingleView({
            id: 'example-single',
            managerid: 'example-single-search',
            beforeLabel: 'Event count: ',
            el: $('#example-single')
        }).render();

        new SingleView({
            id: 'example-single2',
            managerid: 'example-single-search',
            beforeLabel: 'Event count: ',
            classField: 'range',
            el: $('#example-single2')
        }).render();
    
        var rb11 = splunkjs.mvc.Components.getInstance("example-radiogroup");
        var rb12 = document.getElementById("example-radiogroup-result");
        rb11.on("change", function(){
                rb12.innerHTML = rb11.val();
        });

        var rb21 = splunkjs.mvc.Components.getInstance("example-radiogroup2");
        var rb22 = document.getElementById("example-radiogroup2-result");
        rb21.on("change", function(){
                rb22.innerHTML = rb21.val();
        });

        var tb1 = splunkjs.mvc.Components.getInstance("example-textinput1");
        var tb2 = splunkjs.mvc.Components.getInstance("example-textinput2");
        tb1.on("change", function(){
                tb2.val(tb1.val());
        });
        tb2.on("change", function(){
                tb1.val(tb2.val());
        });

        var pb1 = splunkjs.mvc.Components.getInstance("example-passwordinput1");
        var tb3 = splunkjs.mvc.Components.getInstance("example-textinput3");
        pb1.on("change", function(){
                tb3.val(pb1.val());
        });
        tb3.on("change", function(){
                pb1.val(tb3.val());
        });

        var cb1 = splunkjs.mvc.Components.getInstance("example-checkbox");
        var cb2 = document.getElementById("example-checkbox-result");
        cb1.on("change", function(){
                cb2.innerHTML = (cb1.val() ? "true" : "false");
        });

        var cbg1 = splunkjs.mvc.Components.getInstance("example-checkboxgroup");
        var cbgr = document.getElementById("example-checkboxgroup1-result");
        cbg1.on("change", function() {
                cbgr.innerHTML = cbg1.val().join(", ");
        });

        var cbg2 = splunkjs.mvc.Components.getInstance("example-checkboxgroup2");
        var cbgr2 = document.getElementById("example-checkboxgroup2-result");
        cbg2.on("change", function() {
                cbgr2.innerHTML = cbg2.val().join(", ");
        });

        var es1 = splunkjs.mvc.Components.getInstance("example-dropdown")
        var es1r = document.getElementById("example-dropdown-result");
        es1.on("change", function() {
                es1r.innerHTML = es1.val();
        });

        var ms1 = splunkjs.mvc.Components.getInstance("example-multidropdown");
        var msr = document.getElementById("example-multidropdown1-result");
        ms1.on("change", function() {
                msr.innerHTML = ms1.val().join(", ");
        });

        var ms2 = splunkjs.mvc.Components.getInstance("example-multidropdown2");
        var msr2 = document.getElementById("example-multidropdown2-result");
        ms2.on("change", function() {
                msr2.innerHTML = ms2.val().join(", ");
        });

        var es2 = splunkjs.mvc.Components.getInstance("example-dropdown1")
        var es2r = document.getElementById("example-dropdown1-result");
        es2.on("change", function() {
                es2r.innerHTML = es2.val();
        });

        var choices = [{label: " One", value: "One"},
        {label:" Two", value: "Two"}, 
        {label:" Three", value: "Three"}];

        splunkjs.mvc.Components.getInstance("example-radiogroup").settings.set("choices", choices);
        splunkjs.mvc.Components.getInstance("example-dropdown").settings.set("choices", choices);
        splunkjs.mvc.Components.getInstance("example-multidropdown").settings.set("choices", choices);
        splunkjs.mvc.Components.getInstance("example-checkboxgroup").settings.set("choices", choices);

        $("#disable-all").click(function() {
                var ctrls = [rb11, rb21, tb1, tb2, pb1, tb3, cb1, cbg1, cbg2, es1,
                                         ms1, ms2, es2];
                var state = true;
                if (ctrls[0].$("input").first().is(":disabled")) {
                        state = false;
                }
                $.each(ctrls, function(idx, val) {
                        val.settings.set("disabled", state);
                });
        }); 
    }
);
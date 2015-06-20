require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/textinputview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TextInputView
    ) {
        // Instantiate components
        new TextInputView({
            id: "leftField",
            el: $("#leftField"),
            default: "Bob Waters",
            value: mvc.tokenSafe("$fullName$")
        }).render();

        new TextInputView({
            id: "rightField",
            el: $("#rightField"),
            // NOTE: If this default is specified, it will override the
            //       default defined in the view above.
            //default: "$1.00 $2.00", // literal value
            value: mvc.tokenSafe("$fullName$")
        }).render();   
    }
);
require.config({
    paths: {
        'text': './contrib/text',
        'splunk_wftoolkit': '../app/splunk_wftoolkit',
        'prettify': '../app/splunk_wftoolkit/contrib/prettify'
    },
    shim: {
        'prettify': {
            exports: 'prettyPrint'
        }
    }
});
require([
    'splunkjs/ready!',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/headerview',
    'splunkjs/mvc/footerview', 
    'prettify'],
    function(mvc, splunkUtils, HeaderView, FooterView, prettyPrint){
       
        // Initialize common UI - Splunk header and footer
      
        new HeaderView({
            id: 'header',
            el: $('.header'),
        }, {tokens: true}).render();

        new FooterView({
            id: 'footer',
            el: $('.footer')
        }, {tokens: true}).render();

        // Pretty print source code examples on the page
        prettyPrint();
});
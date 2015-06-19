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
        new HeaderView({
            id: 'header',
            el: $('.header'),
        }, {tokens: true}).render();

        new FooterView({
            id: 'footer',
            el: $('.footer')
        }, {tokens: true}).render();

        var pageName = splunkUtils.getPageInfo().page;
        var pagePath = ['splunk_wftoolkit', pageName, pageName].join('/'); 

        require([
            'css!' + pagePath + '.css', 
            pagePath 
        ], function(
                css, 
                pageView
        ){
                pageView.render();
                prettyPrint();
        });
});
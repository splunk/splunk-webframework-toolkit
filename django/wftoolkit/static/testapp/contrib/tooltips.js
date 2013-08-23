function Tooltips(){
    var tooltipTimer = null,
        tooltipOpenCoords = {},
        tooltipIsOpen = false,
        tooltipContents,
        $tooltipContainer,
        isReady = false,
        layouts;

    this.setup = function(svg, $container){
        var self = this,
            data = [0],
            $nodeVal, $nodeGroup, $nodeContainer,
            $linkSource, $linkTarget, $linkContainer;

        $tooltipContainer = $("<div id='tooltipContainer'></div>");

        $nodeContainer = $("<div class='nodeContainer'></div>");
        $nodeVal = $("<div class='node-value tooltipRow'><span class='tooltipLabel'>Value: </span><span class='field1-val'></span></div>");
        $nodeGroup = $("<div class='node-group tooltipRow'></div><div class='group-swatch'></div><div class='group-name'><span class='tooltipLabel'>Group: </span><span class='group-val'></span></div>");
        $nodeContainer.append($nodeVal);
        $nodeContainer.append($nodeGroup);
        $tooltipContainer.append($nodeContainer);

        $linkContainer = $("<div class='linkContainer'></div>");
        $linkSource = $("<div class='source tooltipRow'><span class='tooltipLabel'>Source: </span><span class='source-val'></span></div>");
        $linkTarget = $("<div class='target tooltipRow'><span class='tooltipLabel'>Target: </span><span class='target-val'></span></div>");
        $linkContainer.append($linkSource);
        $linkContainer.append($linkTarget);
        $tooltipContainer.append($linkContainer);

        $tooltipContainer.find('.group-swatch').hide();

        $container.prepend($tooltipContainer);
        $tooltipContainer.hide();

        svg.on('mousemove', function(){
            if(tooltipIsOpen){
                self.close();
            }
        });

        layouts = {
            'nodes': {
                "container": $nodeContainer,
                "slots": {
                    "val": $nodeVal.find('.field1-val'),
                    "group": $nodeGroup.find('.group-val')
                },
                "swatch": $nodeContainer.find('.group-swatch')
            },
            'links': {
                "container": $linkContainer,
                "slots": {
                    "source": $linkSource.find('.source-val'),
                    "target": $linkTarget.find('.target-val')
                }
            }
        };

        isReady = true;
    };

    function clearTooltips(){
        if(isReady){
            $.each(layouts, function(k, layout){
                $.each(layout.slots, function(k, v){
                    // this isnt really neccesary because it's either hidden or shown with newly-replaced content
                    v.empty();
                });
                layout.container.hide();
                if(layout.swatch !== undefined){
                    layout.swatch.hide();
                }
            });
        }        
    }

    this.close = function(){
        // return false;
        var self = this,
            dx, dy;

        if(tooltipTimer !== null){
            window.clearTimeout(tooltipTimer);
        }

        dx = Math.abs(tooltipOpenCoords.x - d3.event.x);
        dy = Math.abs(tooltipOpenCoords.y - d3.event.y);

        /*
        only close the tooltip when the user has moved a certain distance away
        this helps when an element is very small and the user might have 
        difficulty keeping their mouse directly over it
        */
        if(dy > 50 || dx > 50){
            tooltipIsOpen = false;    
            tooltipTimer = window.setTimeout(function(){
                $tooltipContainer.fadeOut(400);
            }, 500);
        }
    };

    this.open = function(layout, data){
        tooltipIsOpen = true;
        tooltipOpenCoords = {
            x: d3.event.x,
            y: d3.event.y
        };
        
        clearTooltips();
        $.each(data.slots, function(k, v){
            layouts[layout]['slots'][k].append(v);
        });
        layouts[layout]['container'].show();
        if(layouts[layout]['swatch'] !== undefined){
            layouts[layout]['swatch'].show().css('background-color', data.swatch);
        }
        $tooltipContainer.fadeIn(400);
    };
}
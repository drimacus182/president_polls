function poll_chart() {

    var lines = []
        , areas = []
        , areaLines = []
        , pointss = []

        , x_domain
        , y_domain

        , yFormat = (function() {
            var base = d3.format(".0d");
            return function(v) {return base(v).replace(/,/g, " ")}
        })()
        , yTickValues
        , yTicks
        , xTickValues
        , x

        , formatMonth = d3.timeFormat("%b")
        , formatYear = d3.timeFormat("%Y")
        // , colors = [
        //     "#58fdff",
        //     "#ff5954",
        //     "#fffe09",
        //     "#4aff0b",
        //     "#2900ff",
        //     "#e03fe0"
        // ];

        , colors = [
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33",
        ];

    function my(selection) {
        selection.each(function(d) {

            var container = d3.select(this);
            var w = container.node().getBoundingClientRect().width;
            var h = container.node().getBoundingClientRect().height;

            // var mh = +container.attr("data-min-height");
            // var h = Math.max(mh, w * (+container.attr("data-aspect-ratio")));

            var canvas = container
                .append("canvas")
                .attr("class", "canvas-pane")
                .attr("width", w)
                .attr("height", h);

            const context = canvas.node().getContext('2d');
            // context.globalAlpha = 1;
            // context.globalCompositeOperation = "overlay";


            var svg = container
                .append("svg")
                .attr("class", "svg-pane");

            var margin = {top: 5, right: 0, bottom: 15, left: 20}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                ;

            context.translate(margin.left, margin.top);

            svg.append("symbol")
                .attr("id", "cross")
                .attr("width", 8)
                .attr("height", 8)
                .attr("viewBox", "-5 -5 10 10")
                .append("path")
                .attr("d", "M-5 -5 L5 5 M5 -5 L-5 5")


            x = d3.scaleTime()
                .range([0, width]);

            var y = d3.scaleLinear()
                .range([height, 0]);

            var line_gen = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.v))
                .curve(d3.curveLinear);

            var area_gen = d3.area()
                .x(d => x(d.date))
                .y0(d => y(d.v0))
                .y1(d => y(d.v1))
                .curve(d3.curveLinear);


            var line_gen_canvas = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.v))
                .curve(d3.curveLinear)
                .context(context);

            var line_gen_top = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.v1))
                .curve(d3.curveLinear);

            var line_gen_bottom = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.v0))
                .curve(d3.curveLinear);

            var area_gen_canvas = d3.area()
                .x(d => x(d.date))
                .y0(d => y(d.v0))
                .y1(d => y(d.v1))
                .context(context);

            var area_gen_gradient_canvas = canvas_grad_line()
                .x(d => x(d.date))
                .y(d => y((d.v0 + d.v1) / 2))
                .width(d => y(d.v0) - y(d.v1))
                .context(context);



            if (x_domain) x.domain(x_domain)
            else throw "Auto x domain not implemented"

            if (y_domain) y.domain(y_domain)
            else throw "Auto y domain not implemented"


            var xAxis = d3.axisBottom(x)
                .tickSizeOuter(10)
                .tickSizeInner(-height)
                .tickPadding(5)
                .tickFormat(multiFormat)

            var yAxis = d3.axisLeft(y)
                .ticks(3)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5);

            if (yFormat) yAxis.tickFormat(yFormat);
            if (yTickValues) yAxis.tickValues(yTickValues);
            if (yTicks) yAxis.ticks(yTicks);
            if (xTickValues) xAxis.tickValues(xTickValues.map(p => p.date));

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            g.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            var area_g = g
                .append("g")
                .attr("class", "chart-pane area-pane");

            var line_g = g
                .append("g")
                .attr("class", "chart-pane line-pane");

            var points_g = g
                .append("g")
                .attr("class", "chart-pane points-pane");

            areaLines.forEach(function(areaLineObj, i){
                drawAreaLinesSvg(areaLineObj, area_g);
            });
            
            pointss.forEach(function(pointsobj){
                drawPoints(pointsobj);
            });
            
            
            //
            //
            //
            //
            
            
            
            function drawLineSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .attr("class", "line " + areaLineObj["class"])
                    .attr("d", line_gen(areaLineObj.data));
            }

            function drawAreaSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .attr("class", "area " + areaLineObj["class"])
                    .attr("d", area_gen(areaLineObj.data));
            }
            
            function drawAreaLinesSvg(areaLine) {
                drawAreaSvg(areaLine, area_g);
                drawLineSvg(areaLine, area_g)
            }

            
            
            
            
            
            
            
            function drawAreaCanvas(areaobj, color) {
                context.beginPath();
                context.fillStyle = color;
                area_gen_gradient_canvas.color(color)(areaobj.data);
                context.fill();

                var c = d3.color(color);
                c.opacity = 0.5;

                context.lineWidth = 5;
                context.beginPath();
                context.strokeStyle = c.toString();
                line_gen_canvas(areaobj.data);
                context.stroke();
            }
            

            function drawPoints(pointsobj) {
                var ent = points_g
                    .append("g")
                    .attr("class", "points " + pointsobj["class"])
                    .selectAll(".cross")
                    .data(pointsobj.data)
                    .enter();

                // ent.append("use")
                //     .attr("class", "cross")
                //     .attr("xlink:href", "#cross")
                //     .attr("class", "line")
                //     .attr("x", d => x(d.date))
                //     .attr("y", d => y(d.v))

                ent.append("circle")
                    .attr("r", 2)
                    .attr("cx", d => x(d.date))
                    .attr("cy", d => y(d.v))
            }
            

        });
    }

    function opacify(color, op) {
        color = d3.color(color);

        return d3.rgb(
            opacify_component(color.r, op),
            opacify_component(color.g, op),
            opacify_component(color.b, op)
        ).toString();

        function opacify_component(c, op){
            return c * op + (1 - op) * 255;
        }
    }

    function multiFormat(date) {
        return (d3.timeYear(date) < date ? formatMonth : formatYear)(date);
    }

    my.addLine = function(value) {
        if (!arguments.length) return;
        lines.push(value);
        return my;
    };

    my.addArea = function(value) {
        if (!arguments.length) return;
        areas.push(value);
        return my;
    };

    my.addAreaLine = function(value) {
        if (!arguments.length) return;
        areaLines.push(value);
        return my;
    };

    my.addPoints = function(value) {
        if (!arguments.length) return;
        pointss.push(value);
        return my;
    };

    my.x_domain = function(value) {
        if (!arguments.length) return x_domain;
        x_domain = value;
        return my;
    };

    my.y_domain = function(value) {
        if (!arguments.length) return y_domain;
        y_domain = value;
        return my;
    };

    my.yFormat = function(value) {
        if (!arguments.length) return yFormat;
        yFormat = value;
        return my;
    };

    my.yTickValues = function(value) {
        if (!arguments.length) return yTickValues;
        yTickValues = value;
        return my;
    };

    my.yTicks = function(value) {
        if (!arguments.length) return yTicks;
        yTicks = value;
        return my;
    };

    my.xTickValues = function(value) {
        if (!arguments.length) return xTickValues;
        xTickValues = value;
        return my;
    };


    return my;
}

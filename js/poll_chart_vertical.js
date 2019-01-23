function poll_chart_vertical() {

    var lines = []
        , areas = []
        , areaLines = []
        , pointss = []

        , x_domain
        , y_domain

        , percentFormat = (function() {
            var base = d3.format(".0%");
            return function(val){ return base(val/100)};
        })()

        , yTickValues
        , yTicks
        , xTickValues
        , x

        , formatMonth = d3.timeFormat("%b")
        , formatYear = d3.timeFormat("%Y")

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
            context.globalCompositeOperation = "multiply";

            var svg = container
                .append("svg")
                .attr("class", "svg-pane");

            var margin = {top: 100, right: 0, bottom: 15, left: 20}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                , top_g = svg.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");
            context.translate(margin.left, margin.top);


            var y = d3.scaleLinear()
                .range([height, 0]);

            var x = d3.scaleTime()
                .range([0, width]);

            var line_gen = d3.line()
                .x(d => x(d.v))
                .y(d => y(d.date))
                .curve(d3.curveLinear);

            var area_gen = d3.area()
                .x0(d => x(d.v0))
                .x1(d => x(d.v1))
                .y(d => y(d.date))
                .curve(d3.curveLinear);

            var area_gen_gradient_canvas = canvas_grad_line()
                .x(d => x((d.v0 + d.v1) / 2))
                .y(d => y(d.date))
                .width(d => Math.abs(x(d.v0) - x(d.v1)))
                .context(context);


            if (x_domain) x.domain(x_domain)
            else throw "Auto x domain not implemented"

            if (y_domain) y.domain(y_domain)
            else throw "Auto y domain not implemented"


            var xAxis = d3.axisTop(x)
                .tickSizeOuter(2)
                .tickSizeInner(-height)
                .tickPadding(5)
                .tickValues(x.domain())
                .tickFormat(percentFormat);

            var yAxis = d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5)
                .tickFormat(multiFormat);

            // if (yFormat) yAxis.tickFormat(yFormat);
            // if (yTickValues) yAxis.tickValues(yTickValues);
            if (yTicks) yAxis.ticks(yTicks);
            if (yTickValues) yAxis
                .tickValues(yTickValues.map(function(poll){ poll.date.__poll_house__ = poll.poll_house; return poll.date }))
                .tickFormat(d => d.__poll_house__);

            g.append("g")
                .attr("class", "axis axis--x")
                // .attr("transform", "translate(0," + height + ")")
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
                // drawAreaCanvas(areaLineObj, colors[i]);
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


            function drawAreaCanvas(areaobj, color) {
                context.beginPath();
                context.fillStyle = color;
                area_gen_gradient_canvas.color(color)(areaobj.data);
                context.fill();
            }


            function drawAreaLinesSvg(areaLine) {
                drawAreaSvg(areaLine, area_g);
                drawLineSvg(areaLine, area_g)
            }

            

            function drawPoints(pointsobj) {
                var ent = points_g
                    .append("g")
                    .attr("class", "points " + pointsobj["class"])
                    .selectAll(".cross")
                    .data(pointsobj.data)
                    .enter();



                ent.append("circle")
                    .attr("r", 2)
                    .attr("cx", d => x(d.v))
                    .attr("cy", d => y(d.date))
            }
            

        });
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

    my.yTickValues = function(value) {
        if (!arguments.length) return yTickValues;
        yTickValues = value;
        return my;
    };


    return my;
}

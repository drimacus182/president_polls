function poll_chart() {

    var lines = []
        , areas = []
        , pointss = []

        , x_domain
        , y_domain

        , yFormat = (function() {
            var base = d3.format(".0d");
            return function(v) {return base(v).replace(/,/g, " ")}
        })()
        , yTickValues
        , yTicks
        , xTicks = 10
        , x

        , formatMonth = d3.timeFormat("%b")
        , formatYear = d3.timeFormat("%Y")
        , colors = ["red", "blue", "green", "yellow", "brown", "pink", "indigo"]
        ;

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

            const ctx = canvas.node().getContext('2d');
            // ctx.globalAlpha = 0.3;


            var svg = container
                .append("svg")
                .attr("class", "svg-pane");

            var margin = {top: 5, right: 0, bottom: 15, left: 20}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                ;

            ctx.translate(margin.left, margin.top);

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

            var area_gen_canvas = canvas_grad_line()
                .x(d => x(d.date))
                .y(d => y((d.v0 + d.v1) / 2))
                .width(d => y(d.v0) - y(d.v1))
                .context(ctx);

            if (x_domain) x.domain(x_domain)
            else throw "Auto x domain not implemented"

            if (y_domain) y.domain(y_domain)
            else throw "Auto y domain not implemented"


            var xAxis = d3.axisBottom(x)
                .tickSizeOuter(10)
                .tickSizeInner(-height)
                .tickPadding(5)
                .tickFormat(multiFormat);

            var yAxis = d3.axisLeft(y)
                .ticks(3)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5);

            if (yFormat) yAxis.tickFormat(yFormat);
            if (yTickValues) yAxis.tickValues(yTickValues);
            if (yTicks) yAxis.ticks(yTicks);
            if (xTicks) xAxis.ticks(xTicks);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            g.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            var area_g = g
                .append("g")
                .attr("class", "area-pane");

            var line_g = g
                .append("g")
                .attr("class", "line-pane");

            var points_g = g
                .append("g")
                .attr("class", "points-pane");

            function drawLine(lineobj) {
                line_g
                    .append("path")
                    .attr("class", "line " + lineobj["class"])
                    .attr("d", line_gen(lineobj.data));
            }

            function drawArea(areaobj) {
                area_g
                    .append("path")
                    .attr("class", "area " + areaobj["class"])
                    .attr("d", area_gen(areaobj.data));
            }

            function drawAreaCanvas(areaobj, color) {
                area_gen_canvas.color(color);
                area_gen_canvas(areaobj.data);
            }

            function drawPoints(pointsobj) {
                points_g
                    .append("g")
                    .attr("class", "points " + pointsobj["class"])
                    .selectAll("circle")
                    .data(pointsobj.data)
                    .enter()
                    .append("circle")
                    .attr("r", 2)
                    .attr("cx", d => x(d.date))
                    .attr("cy", d => y(d.v))
            }

            areas.forEach(function(areaobj, i){
                drawAreaCanvas(areaobj, colors[i]);
            });

            lines.forEach(function(lineobj){
                drawLine(lineobj);
            });

            pointss.forEach(function(pointsobj){
                drawPoints(pointsobj);
            })
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

    my.xTicks = function(value) {
        if (!arguments.length) return xTicks;
        xTicks = value;
        return my;
    };

    return my;
}

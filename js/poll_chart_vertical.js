function poll_chart_vertical() {

    var lines = []
        , areas = []
        , areaLines = []
        , pointss = []

        , x_domain
        , y_domain

        // , percentFormat = (function() {
        //     var base = d3.format(".1%");
        //     return function(val){ return base(val/100)};
        // })()


        , percentFormat = d3.format(".1f")

        , yTickValues
        , yTicks
        , xTickValues
        , x

        , day_format = d3.timeFormat("%d.%m.%Y")

        , formatMonth = d3.timeFormat("%B")
        , formatYear = d3.timeFormat("%Y")
        , formatMonthYear = d3.timeFormat("%B %Y")
        , multiFormat = function(date) {
            return (d3.timeYear(date) < date ? formatMonth : formatMonthYear)(date);
        }

        , colors = [
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33"
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

            var margin = {top: 100, right: 0, bottom: 15, left: 50}
                , width = w - margin.left - margin.right
                , height = h - margin.top - margin.bottom
                , g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                // , top_g = svg.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");
            context.translate(margin.left, margin.top);


            var y = d3.scaleTime()
                .range([height, 0]);

            var x = d3.scaleLinear()
                .range([0, width]);

            var line_gen = d3.line()
                .x(d => x(d.v))
                .y(d => y(d.date))
                .curve(d3.curveLinear);
                // .curve(d3.curveStep);

            var area_gen = d3.area()
                .x0(d => x(d.v0))
                .x1(d => x(d.v1))
                .y(d => y(d.date))
                .curve(d3.curveLinear);

            var area_center_gen = d3.area()
                .x0(d => x(d.v) - Math.abs(x(d.v0) - x(d.v1)) * 0.02)
                .x1(d => x(d.v) + Math.abs(x(d.v0) - x(d.v1)) * 0.02)
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

            var yAxis_ticks = d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5);

            var yAxis = d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(0)
                .tickPadding(5)
                .tickFormat(multiFormat);

            if (yTicks) yAxis.ticks(yTicks);
            if (yTickValues) yAxis_ticks
                .tickValues(yTickValues.map(poll => poll.date));


            g.append("rect")
                .attr("class", "mouse-trap")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height);

            g.append("g")
                .attr("class", "axis axis--x")
                .call(xAxis);

            g.append("g")
                .attr("class", "axis axis--y axis--y--ticks")
                .call(yAxis_ticks);

            var year_lines = g.append("g").attr("class", "year-lines-pane");

            year_lines
                .append("line")
                .attr("class", "year-line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", y(new Date(2018, 0, 1)))
                .attr("y2", y(new Date(2018, 0, 1)));


            year_lines
                .append("line")
                .attr("class", "year-line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", y(new Date(2019, 0, 1)))
                .attr("y2", y(new Date(2019, 0, 1)));


            g.append("g")
                .attr("class", "axis axis--y axis--y--labels")
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
                // drawAreaCanvas(areaLineObj, colors[i]);t
                drawAreaLinesSvg(areaLineObj, area_g);
            });
            
            pointss.forEach(function(pointsobj){
                drawPoints(pointsobj);
            });

            drawDistributionLines(areaLines.map(al => ({"class": al.class, "data": lastElement(al.data)})), g);

            var moving_g = g
                .append("g")
                .attr("class", "moving-g");

            var top_labels = moving_g
                .selectAll("text.result")
                .data(areaLines)
                .enter()
                .append("text")
                .attr("class", (line, i) => "result label fill-color " + line.class)
                .attr("x", line => x(lastElement(line.data).v))
                .attr("y", 0)
                .attr("dy", "-0.5em")
                .text(line => percentFormat(lastElement(line.data).v));

            fix_overlaps(top_labels, 15);

            var top_line = moving_g
                .append("line")
                .attr("class", "top-line")
                .attr("x1", -50)
                .attr("x2", width + 50)
                .attr("y1", 0)
                .attr("y2", 0);

            var top_date_label = moving_g
                .append("text")
                .attr("class", "moving-date")
                .attr("x", width)
                .attr("dx", "1em")
                .attr("y", 0)
                .attr("dy", "-0.5em")
                .text(day_format(y.invert(0)));


            g.on("mousemove", function(){
                var mouse = d3.mouse(this);
                moveTopLine(mouse);

            });


            function moveTopLine(mouse) {
                var mouse_y = Math.max(0, mouse[1]);

                var date = y.invert(mouse_y);

                moving_g
                    .attr("transform", "translate(0, " + mouse_y + ")");

                top_labels
                    // .attr("y", mouse_y)
                    .attr("x", line => x(findClosestDataForDate(line.data, date).v))
                    .text(line => percentFormat((findClosestDataForDate(line.data, date).v)));

                fix_overlaps(top_labels, 15);

                top_date_label
                    .text(day_format(y.invert(mouse_y)));

            }

            function findClosestDataForDate(line_data, date) {
                var min_dist = Math.abs(date - line_data[0].date);
                var min_dist_i = 0;

                for (var i = 0; i< line_data.length; i++) {
                    var dist = Math.abs(date - line_data[i].date);

                    if (dist < min_dist) { min_dist = dist; min_dist_i = i;}
                }

                return line_data[min_dist_i];
            }

            
            function drawLineSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .attr("class", "line stroke-color " + areaLineObj["class"])
                    .attr("d", line_gen(areaLineObj.data));

                // pane
                //     .append("path")
                //     .attr("class", "area center " + areaLineObj["class"])
                //     .attr("d", area_center_gen(areaLineObj.data));

            }

            function drawAreaSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .attr("class", "area fill-color " + areaLineObj["class"])
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
                    .selectAll("circle")
                    .data(pointsobj.data)
                    .enter();
                    // .selectAll(".cross")
                    //


                ent.append("circle")
                    .attr("r", 2)
                    .attr("cx", d => x(d.v))
                    .attr("cy", d => y(d.date))
                    .attr("class", "fill-color")
            }


            function drawDistributionLines(data, pane) {
                pane
                    .append("g")
                    .attr("class", "ditributions_g")
                    .attr("transform", "translate(0, -35)")
                    .selectAll("rect.distribution")
                    .data(data)
                    .enter()
                    .append("rect").attr("class", d => "distribution fill-color " + d.class)
                    .attr("x", d => x(d.data.v0))
                    .attr("width", d => x(d.data.v1) - x(d.data.v0))
                    .attr("y", (d, i) => -15 - i * ( 8 + 3) )
                    .attr("height", 8)
            }


            function lastElement(arr) {
                return arr[arr.length - 1];
            }

            function fix_overlaps(objects, padding) {
                var extra_padding = padding * 0.2;

                objects = objects.nodes().map(node => ({node: node, bbox: node.getBBox()}))
                    .sort((o1, o2) => o1.bbox.x - o2.bbox.x);

                var change_made = true;
                var iterations = 0;

                while (change_made && iterations < 10) {
                    objects.sort((o1, o2) => o1.bbox.x - o2.bbox.x);

                    change_made = false;

                    for (var i = 0; i < objects.length - 1; i++) {
                        var o1 = objects[i], o2 = objects[i + 1];

                        if (!overlaps(o1.bbox, o2.bbox, padding)) continue;

                        var node1_ = d3.select(o1.node);
                        var node2_ = d3.select(o2.node);

                        var overlap_distance = (o1.bbox.x + o1.bbox.width + padding + extra_padding) - o2.bbox.x;

                        node1_.attr("x", +node1_.attr("x") - overlap_distance / 2);
                        node2_.attr("x", +node2_.attr("x") + overlap_distance / 2);

                        o1.bbox = o1.node.getBBox();
                        o2.bbox = o2.node.getBBox();

                        change_made = true;
                    }
                    iterations++
                }
                console.log("Iterations "+ iterations);

                function overlaps(bbox1, bbox2, padding) {
                    return (bbox2.x <= bbox1.x + bbox1.width + padding)
                }
            }

        });
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

    // my.yFormat = function(value) {
    //     if (!arguments.length) return yFormat;
    //     yFormat = value;
    //     return my;
    // };

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

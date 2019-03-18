function poll_chart_vertical() {

    var lines = []
        , areas = []
        , areaLines = []
        , pointss = []

        , x_domain
        , y_domain
        , x_tick_values

        // , percentFormat = (function() {
        //     var base = d3.format(".1%");
        //     return function(val){ return base(val/100)};
        // })()

        , percentFormat = d3.format(".1f")
        , percentWithPercentFormat = (function() {
            var base = d3.format(".1%");
            return function(val){ return base(val/100)};
        })()

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

        , points_tree
        ;

    function my(selection) {
        selection.each(function(d) {

        	points_tree = rbush();

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

            var margin = {top: 200, right: 5, bottom: 15, left: 10}
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

            // var area_gen_gradient_canvas = canvas_grad_line()
            //     .x(d => x((d.v0 + d.v1) / 2))
            //     .y(d => y(d.date))
            //     .width(d => Math.abs(x(d.v0) - x(d.v1)))
            //     .context(context);


            if (x_domain) x.domain(x_domain)
            else throw "Auto x domain not implemented"

            if (y_domain) y.domain(y_domain)
            else throw "Auto y domain not implemented"


            var xAxis = d3.axisTop(x)
                .tickSizeOuter(2)
                .tickSizeInner(-height)
                .tickPadding(5)
                .tickValues(x_tick_values)
                // .ticks(6)
                .tickFormat(percentWithPercentFormat);

            var yAxis_ticks = d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(-width)
                .tickPadding(5);

            var yAxis = d3.axisLeft(y)
                .tickSizeOuter(0)
                .tickSizeInner(0)
                .tickPadding(15)
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
                .call(yAxis)
                .selectAll("text")
                .attr("dy", "-0.5em");



            var area_g = g
                .append("g")
                .attr("class", "chart-pane area-pane");

            var line_g = g
                .append("g")
                .attr("class", "chart-pane line-pane");

            var points_g = g
                .append("g")
                .attr("class", "chart-pane points-pane");

            var points_popup_g = g
                .append("g")
                .attr("class", "chart-pane points-popup-pane");

            areaLines.forEach(function(areaLineObj, i){
                drawAreaLinesSvg(areaLineObj, area_g);
            });

            pointss.forEach(function(pointsobj){
                drawPoints(pointsobj);
            });

            drawDistributionLines(areaLines.map(al => ({
                "class": al.class,
                "data": lastElement(al.data),
                candidate: al.candidate,
                key: al.key,
                __checked__: al.__checked__
            })), g);

            var moving_g = g
                .append("g")
                .attr("class", "moving-g");

            var top_labels_g = moving_g
                .selectAll("g.result_g")
                .data(areaLines)
                .enter()
                .append("g")
                .attr("class", "result_g")
                .classed("hidden", d => !d.__checked__);

            var top_labels_bg = top_labels_g
                .append("text")
                .attr("class", (line, i) => "result label background stroke-pseudo-transparent-color " + line.class)
                .attr("x", line => x(lastElement(line.data).v))
                .attr("y", 0)
                .attr("dy", "-0.5em");


            var top_labels = top_labels_g
                .append("text")
                .attr("class", (line, i) => "result label fill-color " + line.class)
                .attr("x", line => x(lastElement(line.data).v))
                .attr("y", 0)
                .attr("dy", "-0.5em")
                .text(line => percentFormat(lastElement(line.data).v));

            fix_overlaps(top_labels, 15);

            drawBackgroundForLabels();

            var top_line = moving_g
                .append("line")
                .attr("class", "top-line")
                .attr("x1", -50)
                .attr("x2", width + 150)
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

            var annotations_pane = g
                .append("g")
                .attr("class", "annotations-pane");

            d3.select(window).on("scroll", function(){
                // var last_known_scroll_position = window.scrollY;
                // console.log(window.scrollY)
                var top = container.node().getBoundingClientRect().y;

                if (top > -margin.top + 100 + 15 || top < -height - margin.top + 100) return;
                moveTopLine([0, -top -100])

            });


            function drawBackgroundForLabels() {
                top_labels
                    .each(function(d){
                        d.__x__ = +d3.select(this).attr("x");
                        d.__text__ = d3.select(this).text();
                    });

                top_labels_bg
                    .attr("x", d => d.__x__)
                    .text(d => d.__text__);
            }


            function moveTopLine(mouse) {
                var mouse_y = Math.max(0, mouse[1]);

                var date = y.invert(mouse_y);
                var v = x.invert(mouse[0]);

                moving_g
                    .attr("transform", "translate(0, " + mouse_y + ")");

                top_labels
                    // .attr("y", mouse_y)
                    .attr("x", line => x(findClosestDataForDate(line.data, date).v))
                    .text(line => percentFormat((findClosestDataForDate(line.data, date).v)));

                fix_overlaps(top_labels, 15);

                drawBackgroundForLabels();

                top_date_label
                    .text(day_format(y.invert(mouse_y)));

                //popup polls annotations

                var popup_points = findClosestPoints(date, v);

                annotations_pane
                    .selectAll("text.enter")
                    .classed("enter", false)
                    .classed("exit", true)
                    .style("opacity", 1)
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();

                points_popup_g
                    .selectAll("circle.enter")
                    .classed("enter", false)
                    .classed("exit", true)
                    .style("opacity", 1)
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();

                var poll_house_label = annotations_pane
                    .selectAll("text.poll_house.enter")
                    .data(popup_points)
                    .enter()
                    .append("text")
                    .attr("class", "poll_house enter")
                    .attr("x", d => x(d.v))
                    .attr("y", (d, i) => y(d.date) + 10 + i * 35)
                    .attr("dy", "2.5em")
                    .text(d => d.poll_house);

                var percents_background = annotations_pane
                    .selectAll("text.percent-background.enter")
                    .data(popup_points)
                    .enter()
                    .append("text")
                    .attr("class", d => "percent-background enter stroke-pseudo-transparent-color fill-color " + d.candidate)
                    .attr("x", d => x(d.v))
                    .attr("y", (d, i) => y(d.date) + 10 + i * 35 )
                    .attr("dy", "1.5em")
                    .text(d => percentFormat(d.v));

                var percents = annotations_pane
                    .selectAll("text.percent.enter")
                    .data(popup_points)
                    .enter()
                    .append("text")
                    .attr("class", d => "percent enter fill-color " + d.candidate)
                    .attr("x", d => x(d.v))
                    .attr("y", (d, i) => y(d.date) + 10 + i * 35 )
                    .attr("dy", "1.5em")
                    .text(d => percentFormat(d.v));


                // fix_overlaps(poll_house_label, 2);
                // dist_rect.each(function(d){d.__y__ = +d3.select(this).attr("y")});

                points_popup_g
                    .selectAll("circle.enter")
                    .data(popup_points)
                    .enter()
                    .append("circle")
                    .attr("class", d => "enter fill-color " + d.candidate)
                    .attr("cx", d => x(d.v))
                    .attr("cy", d => y(d.date))
                    .attr("r", 4)
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

            function findClosestPoints(date, v) {
                var x_dst = 10;
                var y_dst = 10;

                return points_tree.search({minX: x(v) - x_dst, maxX: x(v) + x_dst, minY: y(date) - y_dst, maxY: y(date) + y_dst})
                    .map(item => item.data);
            }
            
            function drawLineSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .datum(areaLineObj)
                    .attr("class", "line stroke-color " + areaLineObj["class"])
                    .classed("hidden", d => !d.__checked__)
                    .attr("d", d => line_gen(d.data));
            }

            function drawAreaSvg(areaLineObj, pane) {
                pane
                    .append("path")
                    .datum(areaLineObj)
                    .attr("class", "area fill-color " + areaLineObj["class"])
                    .classed("hidden", d => !d.__checked__)
                    .attr("d", d => area_gen(d.data));
            }

            // function drawAreaCanvas(areaobj, color) {
            //     context.beginPath();
            //     context.fillStyle = color;
            //     area_gen_gradient_canvas.color(color)(areaobj.data);
            //     context.fill();
            // }


            function drawAreaLinesSvg(areaLine) {
                drawAreaSvg(areaLine, area_g);
                drawLineSvg(areaLine, area_g)
            }

            

            function drawPoints(pointsobj) {
                var ent = points_g
                    .append("g")
                    .datum(pointsobj)
                    .attr("class", "points " + pointsobj["class"])
                    .classed("hidden", d => !d.__checked__)
                    .selectAll("circle")
                    .data(d => d.data)
                    .enter();

                var circles = ent
                    .append("circle")
                    .attr("r", 2)
                    .attr("cx", d => x(d.v))
                    .attr("cy", d => y(d.date))
                    .attr("class", "fill-color");

                if (!pointsobj.__checked__) return;

                points_tree.load(pointsobj.data.map(function(p) {
                        return {
                            minX: x(p.v),
                            maxX: x(p.v),
                            minY: y(p.date),
                            maxY: y(p.date),
                            data: p
                        }
                    })
                );
            }


            function drawDistributionLines(data, pane) {
                var rect_height = 16;
                var vertical_padding = 3;

                var dist_g = pane
                    .append("g")
                    .attr("class", "distributions_g")
                    .attr("transform", "translate(0, " + (-35 - data.length * (rect_height + vertical_padding)) + ")")
                    .selectAll("g.distribution")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", d => "distribution " + d.key);

                var dist_rect = dist_g
                    .sort((d1, d2) => x(d2.data.v) - x(d1.data.v))
                    .append("rect").attr("class", d => "distribution fill-color " + d.class)
                    .attr("x", d => x(d.data.v0))
                    .attr("width", d => x(d.data.v1) - x(d.data.v0))
                    .attr("height", rect_height)
                    // .sort((d1, d2) => (x(d2.data.v1) - x(d2.data.v0)) - (x(d1.data.v1) - x(d1.data.v0)))
                    .attr("y", (d, i) => i * ( rect_height + vertical_padding))
                    .on("click", function(d){
                        d.__checked__ = !d.__checked__;

                        d3.select(this.parentNode)
                            .selectAll("text.candidate-name")
                            .text((d.__checked__ ? "✓" : "")  + d.candidate);

                        areaLines.filter(al => al.key === d.key)
                            .forEach(al => al.__checked__ = d.__checked__);

                        var sel_p = pointss.filter(pp => pp.key === d.key);
                        sel_p.forEach(pp => pp.__checked__ = d.__checked__);

                        top_labels_g
                            .classed("hidden", dd => !dd.__checked__);

                        area_g
                            .selectAll(".area")
                            .classed("hidden", dd => !dd.__checked__);

                        area_g
                            .selectAll(".line")
                            .classed("hidden", dd => !dd.__checked__);

                        points_g
                            .selectAll(".points")
                            .classed("hidden", dd => !dd.__checked__);

                        if (d.__checked__) {
                            sel_p.forEach(function(pp){
                                points_tree.load(pp.data.map(function(p) {
                                        return {
                                            minX: x(p.v),
                                            maxX: x(p.v),
                                            minY: y(p.date),
                                            maxY: y(p.date),
                                            data: p
                                        }
                                    })
                                );
                            });
                        } else {
                            points_tree = rbush();

                            pointss
                                .filter(pp => pp.__checked__)
                                .forEach(function(pp){
                                    points_tree.load(pp.data.map(function(p) {
                                            return {
                                                minX: x(p.v),
                                                maxX: x(p.v),
                                                minY: y(p.date),
                                                maxY: y(p.date),
                                                data: p
                                            }
                                        })
                                    );
                                })
                        }

                        fix_overlaps(top_labels, 15);
                    });

                dist_rect.each(function(d){d.__y__ = +d3.select(this).attr("y")});

                dist_g
                    .append("line")
                    .attr("class", "median-line stroke-color")
                    .attr("x1", d => x(d.data.v))
                    .attr("x2", d => x(d.data.v))
                    .attr("y1", d => d.__y__)
                    .attr("y2", d => d.__y__ + rect_height);

                dist_g
                    .append("text")
                    .attr("class", "candidate-name background stroke-pseudo-transparent-color")
                    .attr("x", d => x(d.data.v0))
                    .attr("y", d => d.__y__)
                    .attr("dy", "0.9em")
                    .text(d => (d.__checked__ ? "✓" : "")  + d.candidate);
                
                dist_g
                    .append("text")
                    .attr("class", "candidate-name")
                    .attr("x", d => x(d.data.v0))
                    .attr("y", d => d.__y__)
                    .attr("dy", "0.9em")
                    .text(d => (d.__checked__ ? "✓" : "")  + d.candidate)
                    .each(function(d){ d.__label_length__ = this.getBBox().width });

                dist_g
                    .append("text")
                    .attr("class", "percent bottom-percent fill-color")
                    .attr("x", d => x(d.data.v0))
                    .attr("y", d => d.__y__)
                    .attr("dy", "1em")
                    .attr("dx", "-0.3em")
                    .text(d => percentFormat(d.data.v0));

                dist_g
                    .append("text")
                    .attr("class", "percent up-percent fill-color")
                    .attr("x", d => Math.max(x(d.data.v1), x(d.data.v0) + d.__label_length__ + 42) )
                    .attr("y", d => d.__y__)
                    .attr("dy", "1em")
                    .text(d => percentFormat(d.data.v1));

                dist_g
                    .append("text")
                    .attr("class", "percent median-percent fill-color")
                    .attr("x", d => Math.max(x(d.data.v), x(d.data.v0) + d.__label_length__ + 2))
                    .attr("y", d => d.__y__)
                    .attr("dy", "1em")
                    .attr("dx", "0.3em")
                    .text(d => percentFormat(d.data.v));

            }


            function lastElement(arr) {
                return arr[arr.length - 1];
            }

            function fix_overlaps(objects, padding) {
                var extra_padding = padding * 0.2;

                objects = objects
                    .filter(d => d.__checked__)
                    .nodes()
                    .map(node => ({node: node, bbox: node.getBBox()}))
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


            function fix_overlaps_y(elements, height) {
                elements = elements.nodes().map(node => ({node: node, bbox: node.getBBox()}));

                var fixed = [elements[0]];

                for (var i = 1; i < elements.length; i++) {
                    var el = elements[i];

                    while (true) {
                        el.bbox.y += height;
                        if (el.bbox.y > 0 || fixed.some(_el_ => overlaps(el.bbox, _el_.bbox))) break;
                    }

                    el.bbox.y -= height;
                    fixed.push(el);
                }

                elements.forEach(function(el){
                    var d3_el = d3.select(el.node);
                    var el_y = +d3_el.attr("y");
                    var old_bbox_y = el.node.getBBox().y;

                    var correction = el.bbox.y - old_bbox_y;

                    d3_el.attr("y", el_y + correction);
                });

                function overlaps(bbox1, bbox2) {
                    return (bbox1.y == bbox2.y) && !(bbox2.x + bbox2.width <= bbox1.x  ||  bbox2.x >= bbox1.x + bbox1.width)
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

    my.x_tick_values = function(value) {
        if (!arguments.length) return x_tick_values;
        x_tick_values = value;
        return my;
    };


    return my;
}

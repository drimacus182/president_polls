(function() {



    var candidates_checked = ["Tymoshenko", "Poroshenko", "Zelensky"];
    var candidates_unchecked = ["Grytsenko", "Boyko", "Lyashko"];

    var candidates_w_u_checked = ["Tymoshenko", "Poroshenko", "Zelensky", "Undecided"];
    var candidates_w_u_unchecked = ["Grytsenko", "Boyko", "Lyashko"];

    var all_candidates =  candidates_w_u_checked.concat(candidates_w_u_unchecked);

    var display_names = __page_locale__.display_names;
    var data_root = __page_locale__.data_root;

    d3.queue()
        .defer(d3.csv, data_root + "chart_data_lines.csv")
        .defer(d3.csv, data_root + "chart_data_points.csv")
        .await(function(err, raw_data_lines, raw_data_points) {

            if (err) throw err;

            raw_data_lines.forEach(function(d) {
                d.median = + d.median;
                d.lower = + d.lower;
                d.upper = + d.upper;
                d.date = new Date(d.date);
                delete d[""];
            });

            raw_data_points.forEach(function(d) {
                d.date = new Date(d.end_date);
                all_candidates.forEach(function(candidate) {d[candidate] = toNumber(d[candidate])});
                delete d[""];
            });

            var chart1 = makeChart(raw_data_lines, raw_data_points, candidates_checked,
                candidates_unchecked, [3,21], [3,6,9,12,15,18,21]);

            var chart2 = makeChart(raw_data_lines, raw_data_points, candidates_w_u_checked,
                candidates_w_u_unchecked, [3,27], [3,6,9,12,15,18,21,24,27]);

            var chart_select = d3.select("#chart-select").on("change", function(){
                drawChart(chart_select.node().value)
            });

            drawChart(chart_select.node().value);

            d3.selectAll("svg .axis--y--labels .tick text").filter(function(){
                return ['березень', 'March'].indexOf(d3.select(this).text()) >= 0;
            }).attr("dy", "0.7em");

            function drawChart(selected_chart) {
                d3.select("#main_chart_vertical").selectAll("*").remove();

                if (selected_chart === "who-vote") d3.select("#main_chart_vertical").call(chart1);
                else d3.select("#main_chart_vertical").call(chart2);
            }

            function makeChart(raw_data_lines, raw_data_points, candidates_checked, 
                               candidates_unchecked, x_domain, x_tick_values) {

                var candidates = candidates_checked.concat(candidates_unchecked);

                var points_data_long = [];

                candidates.forEach(function(candidate){
                    Array.prototype.push.apply(points_data_long, raw_data_points.map(d => ({
                        date: d.date,
                        candidate: candidate,
                        v: d[candidate],
                        poll_house: d.poll_house
                    })).filter(obj => obj.v != null))
                });

                var points_data = d3.nest()
                    .key(d => d.candidate)
                    .entries(points_data_long);

                var polls = d3.nest()
                    .key(d => d.poll_house + "---" + d.date)
                    .entries(points_data_long);

                polls.forEach(function(d) {
                    d.date = d.values[0].date;
                    d.poll_house = d.values[0].poll_house
                });


                var data_lines_map = d3.nest()
                    .key(d => d.candidate)
                    .map(raw_data_lines);

                var lines_data = candidates.map(function(candidate) {
                    return {key: candidate, values: data_lines_map.get(candidate)};
                });

                var main_chart = poll_chart_vertical()
                    .y_domain(d3.extent(raw_data_lines, d => d.date))
                    .x_domain(x_domain)
                    .x_tick_values(x_tick_values)
                    .yTickValues(polls);


                lines_data.forEach(function(line, i) {
                    main_chart.addAreaLine({
                        data: line.values.map(d => ({date: d.date, v: d.median, v0: d.lower, v1: d.upper})),
                        "class": "candidate_" + i + " " + line.key,
                        candidate: display_names[line.key],
                        key: line.key,
                        __checked__: candidates_checked.includes(line.key)
                    });
                });

                points_data.forEach(function(candidate_obj, i) {
                    main_chart.addPoints({
                        data: candidate_obj.values,
                        "class": "candidate_" + i + " " + candidate_obj.key,
                        key: candidate_obj.key,
                        __checked__: candidates_checked.includes(candidate_obj.key)
                    })
                });

                return main_chart;
            }

        });

    function toNumber(str) {
        if (!str || !str.length || str == "NA") return null;
        return +str;
    }
})();



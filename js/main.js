(function() {
    d3.csv("data/chart_data_lines.csv", function(err, raw_data) {

        raw_data.forEach(function(d) {
            d.median = + d.median;
            d.lower = + d.lower;
            d.upper = + d.upper;
            d.date = new Date(d.date);
            delete d[""];
        });

        var lines_data = d3.nest()
            .key(d => d.candidate)
            .entries(raw_data);

        console.log(raw_data);
        console.log(lines_data);

        var main_chart = poll_chart()
            .x_domain(d3.extent(raw_data, d => d.date))
            .y_domain([5,18]);


        lines_data.forEach(function(line, i) {
            main_chart.addLine({
                data: line.values.map(d => ({date: d.date, v: d.median})),
                "class": "line_" + i + " " + line.key
            });

            main_chart.addArea({
                data: line.values.map(d => ({date: d.date, v0: d.lower, v1: d.upper})),
                "class": "area_" + i + " " + line.key
            });
        });

        
        d3.select("#main_chart").call(main_chart);

        

        



    });
})();



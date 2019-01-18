(function() {
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Vakarchuk","Boyko","Lyashko","Sadovy"];
    var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko","Lyashko"];
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko"];
    // var candidates = ["Tymoshenko","Poroshenko"];


    d3.queue()
        .defer(d3.csv, "data/chart_data_lines.csv")
        .defer(d3.csv, "data/chart_data_points.csv")
        .await(function(err, raw_data_lines, raw_data_points) {

            raw_data_lines.forEach(function(d) {
                d.median = + d.median;
                d.lower = + d.lower;
                d.upper = + d.upper;
                d.date = new Date(d.date);
                delete d[""];
            });

            raw_data_points.forEach(function(d) {
                d.date = new Date(d.end_date);
                candidates.forEach(function(candidate) {d[candidate] = toNumber(d[candidate])})
                delete d[""];
            });

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

            console.log(points_data);

            var lines_data = d3.nest()
                .key(d => d.candidate)
                .entries(raw_data_lines)
                .filter(obj => candidates.includes(obj.key));

            console.log(raw_data_lines);
            console.log(lines_data);

            var main_chart = poll_chart()
                .x_domain(d3.extent(raw_data_lines, d => d.date))
                .y_domain([3,20]);


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

            points_data.forEach(function(candidate_obj, i) {
                main_chart.addPoints({
                    data: candidate_obj.values,
                    "class": "points_" + i + " " + candidate_obj.key
                })
            });





            d3.select("#main_chart").call(main_chart);
    });

    function toNumber(str) {
        if (!str || !str.length || str == "NA") return null;
        return +str;
    }
})();



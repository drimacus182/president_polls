(function() {
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko","Lyashko"];
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky","Boyko"];
    // var candidates = ["Tymoshenko","Poroshenko","Grytsenko","Zelensky"];
    // var candidates = ["Tymoshenko","Poroshenko"];
    // var candidates = ["Tymoshenko","Poroshenko","Zelensky"];

    var candidates_checked = ["Tymoshenko", "Poroshenko", "Zelensky"];
    var candidates_unchecked = ["Grytsenko", "Boyko", "Lyashko"];

    var candidates = candidates_checked.concat(candidates_unchecked);

    var display_names = {
        "Tymoshenko": "Тимошенко",
        "Poroshenko": "Порошенко",
        "Grytsenko": "Гриценко",
        "Zelensky": "Зеленський",
        "Boyko": "Бойко",
        "Lyashko": "Ляшко",
        "Sadovy": "Садовий"
    };

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
                candidates.forEach(function(candidate) {d[candidate] = toNumber(d[candidate])});
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

            // lines_data.forEach(line => line.values = line.values.filter((v, i) => i % 150 == 0));

            var main_chart_vertical = poll_chart_vertical()
                .y_domain(d3.extent(raw_data_lines, d => d.date))
                .x_domain([3,18])
                .yTickValues(polls);


            lines_data.forEach(function(line, i) {
                main_chart_vertical.addAreaLine({
                    data: line.values.map(d => ({date: d.date, v: d.median, v0: d.lower, v1: d.upper})),
                    "class": "candidate_" + i + " " + line.key,
                    candidate: display_names[line.key],
                    key: line.key,
                    __checked__: candidates_checked.includes(line.key)
                });
            });

            points_data.forEach(function(candidate_obj, i) {
                main_chart_vertical.addPoints({
                    data: candidate_obj.values,
                    "class": "candidate_" + i + " " + candidate_obj.key,
                    key: candidate_obj.key,
                    __checked__: candidates_checked.includes(candidate_obj.key)
                })
            });

            d3.select("#main_chart_vertical").call(main_chart_vertical);


            d3.selectAll("svg .axis--y--labels .tick text").filter(function(){
                return d3.select(this).text() == 'лютий';
            }).attr("dy", "0.7em")


        });

    function toNumber(str) {
        if (!str || !str.length || str == "NA") return null;
        return +str;
    }
})();



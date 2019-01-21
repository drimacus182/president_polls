function canvas_grad_line() {

    var x,
        y,
        width,
        color,
        context;

    function line(data) {

        // var distribution = [1,20,190,1140,4845,15504,38760,77520,125970,167960,184756,167960,125970,77520,38760,15504,4845,1140,190,20,1];
        // var distribution = [1,6,15,20,15,6,1];
        var distribution = [2,3,10,20,10,3,2];
        // var distribution = [1,40,780,9880,91390,658008,3838380,18643560,76904685,273438880,847660528,2311801440,5586853480,12033222880,23206929840,40225345056,62852101650,88732378800,113380261800,131282408400,137846528820,131282408400,113380261800,88732378800,62852101650,40225345056,23206929840,12033222880,5586853480,2311801440,847660528,273438880,76904685,18643560,3838380,658008,91390,9880,780,40,1];
        // var distribution = [5852925,14307150,30045015,54627300,86493225,119759850,145422675,155117520,145422675,119759850,86493225,54627300,30045015,14307150,5852925];
        // var distribution = [54627300,86493225,119759850,145422675,155117520,145422675,119759850,86493225,54627300];
        var l = distribution.length;
        var peak_amp = d3.max(distribution);

        
        
        var normalised_distribution = distribution.map(d => d/peak_amp);

        normalised_distribution.forEach(function(opacity, i) {
            var gen = d3.area()
                    .x(x)
                    .y0(d => y(d) - width(d)/2 + width(d)/l *i)
                    .y1(d => y(d) - width(d)/2 + width(d)/l * (i+1))
                    .curve(d3.curveLinear)
                    .context(context)
                ;

            var c = d3.color(color);
            c.opacity = opacity * 0.79;

            context.beginPath();
            gen(data);
            context.fillStyle = c.toString();
            context.fill();
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

    line.x = function(val) {
        if (!arguments.length) return x;
        x = val;
        return line;
    };

    line.y = function(val) {
        if (!arguments.length) return y;
        y = val;
        return line;
    };

    line.width = function(val) {
        if (!arguments.length) return width;
        width = val;
        return line;
    };

    line.context = function(val) {
        if (!arguments.length) return context;
        context = val;
        return line;
    };

    line.color = function(val) {
        if (!arguments.length) return color;
        color = val;
        return line;
    };


    return line;
}
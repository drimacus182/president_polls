function canvas_grad_line() {

    var x,
        y,
        width,
        color,
        context;
    
    function line_x(data) {
        var n = data.length;
        // var distribution = [1,20,190,1140,4845,15504,38760,77520,125970,167960,184756,167960,125970,77520,38760,15504,4845,1140,190,20,1];
        var distribution = [0,0.2, 0.5, 1,2,3,5,8,5,3,2,1,0.5, 0.2, 0];

        // var distribution = [1,6,15,20,15,6,1];

        var l = distribution.length;
        var peak_amp = d3.max(distribution);

        var normalised_distribution = distribution.map(d => d/peak_amp * 0.35);

        // normalised_distribution.forEach(function(opacity, i) {
        //     var gen = d3.area()
        //             .x(x)
        //             .y0(d => y(d) - width(d)/2 + width(d)/l *i)
        //             .y1(d => y(d) - width(d)/2 + width(d)/l * (i+1))
        //             .curve(d3.curveLinear)
        //             .context(context)
        //         ;
        //
        //     var c = d3.color(color);
        //     c.opacity = opacity * 0.79;
        //
        //     context.beginPath();
        //     gen(data);
        //     context.fillStyle = c.toString();
        //     context.fill();
        // });
        //

        // debugger;
        var prev_d = data[0];

        for (var i = 1; i < n; i++) {
            var d = data[i];

            var w = +width(prev_d);


            var grad = context.createLinearGradient(0, +y(prev_d) - w/2, 0, +y(prev_d) + w/2);

            normalised_distribution.forEach(function(opacity, i){
                // color.opacity = 0.025 + opacity * 0.95;
                // color.opacity = 0 + opacity * 1;
                grad.addColorStop(i / (l-1), opacify(color, opacity));
            });

            // color.opacity = 0.025;
            // color.opacity = 0.0;
            // grad.addColorStop(1, opacify(color, 0));

            context.strokeStyle = grad;

            context.beginPath();
            context.lineWidth = w;
            context.moveTo(+x(prev_d), +y(prev_d));
            context.lineTo(+x(d)+2, +y(prev_d));
            context.stroke();

            prev_d = d;
        }
    }

    function line(data) {
        var n = data.length;
        // var distribution = [1,20,190,1140,4845,15504,38760,77520,125970,167960,184756,167960,125970,77520,38760,15504,4845,1140,190,20,1];
        var distribution = [0,0.2, 0.5, 1,2,3,5,8,5,3,2,1,0.5, 0.2, 0];

        // var distribution = [1,6,15,20,15,6,1];

        var l = distribution.length;
        var peak_amp = d3.max(distribution);

        var normalised_distribution = distribution.map(d => d/peak_amp * 0.5);

        var prev_d = data[0];

        for (var i = 1; i < n; i++) {
            var d = data[i];

            var w = +width(prev_d);

            // var grad = context.createLinearGradient(0, +y(prev_d) - w/2, 0, +y(prev_d) + w/2);
            var grad = context.createLinearGradient(+x(prev_d) - w/2, 0, +x(prev_d) + w/2, 0);

            normalised_distribution.forEach(function(opacity, i){
                grad.addColorStop(i / (l-1), opacify(color, opacity));
            });

            context.strokeStyle = grad;

            context.beginPath();
            context.lineWidth = w;
            context.moveTo(+x(prev_d), +y(prev_d));
            context.lineTo(+x(prev_d), +y(d));
            context.stroke();

            prev_d = d;
        }
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
        color = d3.color(val);
        return line;
    };


    return line;
}
function canvas_grad_line() {

    var x,
        y,
        width,
        color,
        context;

    // function line(data) {
    //     var n = data.length;
    //
    //     var prev_d = data[0];
    //
    //     for (var i = 1; i < n; i++) {
    //         var d = data[i];
    //
    //         var w = +width(prev_d);
    //
    //         var grad = context.createLinearGradient(0, +y(prev_d) - w/2, 0, +y(prev_d) + w/2);
    //         color.opacity = 0.025;
    //         grad.addColorStop(0, color.toString());
    //         color.opacity = 0.15;
    //         grad.addColorStop(0.25, color.toString());
    //         color.opacity = 1;
    //         grad.addColorStop(0.5, color.toString());
    //         color.opacity = 0.15;
    //         grad.addColorStop(0.75, color.toString());
    //         color.opacity = 0.025;
    //         grad.addColorStop(1, color.toString());
    //
    //         context.strokeStyle = grad;
    //
    //         context.beginPath();
    //         context.lineWidth = w;
    //         context.moveTo(+x(prev_d), +y(prev_d));
    //         context.lineTo(+x(d), +y(prev_d));
    //         context.stroke();
    //        
    //         prev_d = d;
    //     }
    // }

    function line(data) {
        var n = data.length;
        var distribution = [1,20,190,1140,4845,15504,38760,77520,125970,167960,184756,167960,125970,77520,38760,15504,4845,1140,190,20,1];

        // var distribution = [1,6,15,20,15,6,1];

        var l = distribution.length;
        var peak_amp = d3.max(distribution);

        var normalised_distribution = distribution.map(d => d/peak_amp);

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
        var prev_d = data[0];

        for (var i = 1; i < n; i++) {
            var d = data[i];

            var w = +width(prev_d);


            var grad = context.createLinearGradient(0, +y(prev_d) - w/2, 0, +y(prev_d) + w/2);

            normalised_distribution.forEach(function(opacity, i){
                color.opacity = 0.025 + opacity * 0.95;
                grad.addColorStop(i / (l - 1), color.toString());
            });

            color.opacity = 0.025;
            grad.addColorStop(1, color.toString());

            context.strokeStyle = grad;

            context.beginPath();
            context.lineWidth = w;
            context.moveTo(+x(prev_d), +y(prev_d));
            context.lineTo(+x(d), +y(prev_d));
            context.stroke();

            prev_d = d;
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
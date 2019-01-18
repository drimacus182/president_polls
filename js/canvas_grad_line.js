function canvas_grad_line() {

    var x,
        y,
        width,
        color,
        context;

    function line(data) {
        var n = data.length;

        var prev_d = data[0];

        for (var i = 1; i < n; i++) {
            var d = data[i];

            var w = +width(prev_d);

            var grad = context.createLinearGradient(0, +y(prev_d) - w/2, 0, +y(prev_d) + w/2);
            color.opacity = 0.05;
            grad.addColorStop(0, color.toString());
            color.opacity = 0.15;
            grad.addColorStop(0.25, color.toString());
            color.opacity = 1;
            grad.addColorStop(0.5, color.toString());
            color.opacity = 0.15;
            grad.addColorStop(0.75, color.toString());
            color.opacity = 0.05;
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
var svg = d3.select("svg"),
	margin = {
		top: 20,
		right: 20,
		bottom: 30,
		left: 40
	},
	width = +svg.attr("width") - margin.left - margin.right,
	height = +svg.attr("height") - margin.top - margin.bottom,
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
	.rangeRound([0, width])
	.paddingInner(0.05)
	.align(0.1);

var y = d3.scaleLinear()
	.rangeRound([height, 0]);

var z = d3.scaleOrdinal().range(d3.schemeCategory20c);
	// OLD STUFF .range(['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#d2f53c', '#fabebe', '#008080', '#e6beff', '#aa6e28','#fffac8','#800000']);

d3.csv("deaths.csv", function (d, i, columns) {
	for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
	d.total = t;
	return d;
}, function (error, data) {
	if (error) throw error;

	var keys = data.columns.slice(1);

	data.sort(function (a, b) {
		return b.total - a.total;
	});
	x.domain(data.map(function (d) {
		return d.country;
	}));
	y.domain([0, d3.max(data, function (d) {
		return d.total;
	})]).nice();
	z.domain(keys);

	g.append("g")
		.selectAll("g")
		.data(d3.stack().keys(keys)(data))
		.enter().append("g")
		.attr("fill", function (d) {
			return z(d.key);
		})
		.selectAll("rect")
		.data(function (d) {
			return d;
		})
		.enter().append("rect")
		.attr("x", function (d) {
			return x(d.data.country);
		})
		.attr("y", function (d) {
			return y(d[1]);
		})
		.attr("height", function (d) {
			return y(d[0]) - y(d[1]);
		})
		.attr("width", x.bandwidth());

	g.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	g.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(y).ticks(null))
		.append("text")
		.attr("x", 5)
		.attr("y", y(y.ticks().pop()) + 0.5)
		.attr("dy", "0.32em")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.text("Deaths from Avian Influenza");

	var legend = g.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g")
		.data(keys.slice().reverse())
		.enter().append("g")
		.attr("transform", function (d, i) {
			return "translate(0," + i * 20 + ")";
		});

	legend.append("rect")
		.attr("x", width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", z);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function (d) {
			return d;
		});
});

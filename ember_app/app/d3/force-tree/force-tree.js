var forceTree = (function() {
  var width = 960,
      height = 1000,
      clickCallback,
      clickContext;

  function inner(selections) {
    selections.each(function(graph, i) {
      var color = d3.scale.category20();

      var force = d3.layout.force()
          .charge(-120)
          .linkDistance(30)
          .size([width, height]);

      var svg = d3.select(this).append("svg")
          .attr("width", width)
          .attr("height", height);

        force
            .nodes(graph.nodes)
            .links(graph.links)
            .on('tick', tick)
            .on('end', end)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
          .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        function tick(e) {
          var k = 6 * e.alpha;
          graph.links.forEach(function(d, i) {
            d.target.y += k;
            d.source.y -= k;
          });

          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        function end(e) {
          var offset = 2000;
          console.log('got end: ', e);
          link.attr("y1", function(d) { return d.source.y + offset; })
              .attr("y2", function(d) { return d.target.y + offset; });

          node.attr("cy", function(d) { return d.y + offset; });
        }
      });
    }

    inner.clickCallback = function(context, callback) {
      if (!arguments.length) { return clickCallback; }
      clickContext = context;
      clickCallback = callback;
      return inner;
    };

  return inner;
}());
export default forceTree;

var forceTree = (function() {
  var width = 960,
      height = 600,
      clickCallback,
      clickContext;

  function inner(selections) {
    selections.each(function(graph, i) {
      var color = d3.scale.category20();

      var force = d3.layout.force()
          .charge(-120)
          .linkDistance(90)
          .size([width, height]);

      var svg = d3.select(this).append("svg")
          .attr("width", width)
          .attr("height", height);

      force
          .nodes(graph.nodes)
          .links(graph.links)
          .on('tick', tick)
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
          .attr("r", 10)
          .style("fill", function(d) { return color(d.group); })
          .call(force.drag);

      node.append("title")
          .text(function(d) { return d.name; });

      function tick(e) {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
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

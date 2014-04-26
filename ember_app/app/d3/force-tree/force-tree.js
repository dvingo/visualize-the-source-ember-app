var forceTree = (function() {
  var width = 960,
      height = 500,
      clickCallback,
      clickContext;

  function inner(selection) {
    selection.each(function(root, i) {
      var svg = d3.select(this).append('svg'),
          svgGroup = svg.append('g'),
          link = svgGroup.selectAll(".link"),
          node = svgGroup.selectAll(".node"),
          zoomListener;

      svg.attr("width", width)
         .attr("height", height);

      var force = d3.layout.force()
          .size([width, height])
          .on("tick", tick);

      update();

      zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
      svg.call(zoomListener);

      function update() {
        var nodes = flatten(root),
            links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Update the links…
        link = link.data(links, function(d) { return d.target.id; });

        // Exit any old links.
        link.exit().remove();

        // Enter any new links.
        link.enter().insert("line", ".node")
            .attr("class", "link")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // Update the nodes…
        node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

        // Exit any old nodes.
        node.exit().remove();

        // Enter any new nodes.
        node.enter().append("circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) { return Math.sqrt(d.numLines) / 2 || 4.5; })
            .style("fill", color)
            .on("click", click)
            .call(force.drag);
      }

      function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        //svgGroup.selectAll('g.node').filter(function(d) {
          //return d.type === 'directory';
        //}).selectAll('text').attr("transform", function(t, i) {
          //var s = d3.event.scale, factor = 1, vertOffset = false, translate = 0,
              //returnString = '';
          //if (s >= 0.9) {
            //factor = 1;
          //} else if (s >= 0.5) {
            //factor = 1.2;
          //} else if (s >= 0.4) {
            //factor = 1.3;
          //} else if (s >= 0.3) {
            //factor = 2;
          //} else if (s >= 0.2) {
            //translate = 2 * -i;
            //factor = 3;
          //} else {
            //translate = 2 * -i;
            //factor = 6;
          //}
          //returnString = "scale(" + factor + ")";
          //if (vertOffset) {
            //returnString = "scale(" + factor + ")" + "translate(" + translate + ")";
          //}
          //if (orientation === 'horizontal') {
            //returnString += svgRotate(20,0,0);
          //}
          //return returnString;
        //});
      }

      function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

      // Color leaf nodes orange, and packages white or blue.
      function color(d) {
        return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
      }

      // Toggle children on click.
      function click(d) {
        if (!d3.event.defaultPrevented) {
          clickCallback.call(clickContext, d);
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update();
        }
      }

      // Returns a list of all nodes under the root.
      function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node) {
          if (node.children) node.children.forEach(recurse);
          if (!node.id) node.id = ++i;
          nodes.push(node);
        }
        recurse(root);
        return nodes;
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

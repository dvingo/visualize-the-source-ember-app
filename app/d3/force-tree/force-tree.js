import { clearId, toggleChildren } from '../tree/util';
var forceTree = (function() {
  var width = 960,
      height = 500,
      clickCallback,
      clickContext,
      j = 0;

  function inner(selection) {
    selection.each(function(root, i) {
      var svg = d3.select(this).append('svg'),
          svgGroup = svg.append('g'),
          link = svgGroup.selectAll(".link"),
          node = svgGroup.selectAll(".node"),
          circle = svgGroup.selectAll(".node circle"),
          text = svgGroup.selectAll(".node text"),
          zoomListener;

      svg.attr("width", width)
         .attr("height", height);

      var force = d3.layout.force()
          .size([width, height])
          .linkDistance(40)
          .on("tick", tick);

      clearId(root);
      update();

      zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
      svg.call(zoomListener);

      function update() {
        var nodes = flatten(root);
        var links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Update the links…
        link = link.data(links, function(d) { return d.target.id || (d.target.id = ++j); });

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
        node = node.data(nodes, function(d) { return d.id; });

        // Exit any old nodes.
        node.exit().remove();

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", function(d) { return 2; })
            .style("fill", color);

        nodeEnter.append("text")
            .attr("x", function(d) { return 5; })
            .attr("y", function(d) { return 5; })
            .attr("font-size", "8px")
            .text(function(d) { return d.name; });

        nodeEnter.call(force.drag);
      }

      function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }

      function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

         node.attr("transform", function(d, i) {
          return "translate(" + d.x + "," + d.y + ")";
         });
      }

      // Color leaf nodes orange, and packages white or blue.
      function color(d) {
        return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
      }

      // Toggle children on click.
      function click(d) {
        if (!d3.event.defaultPrevented) {
          if (clickCallback) { clickCallback.call(clickContext, d); }
          toggleChildren(d);
          update();
        }
      }

      // Returns a list of all nodes under the root.
      function flatten(root) {
        var nodes = [], level, levels = [], currentDepth = 0, maxDepth = 10;
        nodes.push(root);
        levels.push(root.children);
        while (currentDepth < maxDepth) {
          level = levels[currentDepth];
          if (!level) { break; }
          addChildren(level);
          addNextLevel(level);
          currentDepth += 1;
        }
        return nodes;

        function addChildren(children) {
          var deleteChildren = (currentDepth + 1) === maxDepth;
          children.forEach(function(child) {
            if (deleteChildren && child.children) {
              delete child.children;
            }
            nodes.push(child);
          });
        }

        function addNextLevel(currentLevel) {
          var nextLevel = levels[currentDepth + 1] = [];
          currentLevel.forEach(function(node) {
            if (!node.children) return;
            node.children.forEach(function(child) {
              nextLevel.push(child);
            });
          });
        }
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

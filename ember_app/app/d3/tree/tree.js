import { clearId, collapse, svgRotate, svgTranslate,
  toggleChildren } from './util';

var tree = (function() {
  var width = 900,
      height = 900,
      duration = 750,
      clickCallback,
      clickContext,
      j = 0,
      separation = function(a, b) {
        return (a.parent === b.parent ? 2 : 4) / a.depth;
      },
      diagonal = d3.svg.diagonal()
        .projection(function(d) {
          return [d.y, d.x];
        });

  // Run the visualization
  function inner(selection) {
    selection.each(function(root, i) {
      var svg = d3.select(this).append('svg');
      root.x0 = height / 2;
      root.y0 = 100;

      svg.attr('width', width)
         .attr('height', height);

      var cluster = d3.layout.cluster()
           .size([height, width - 160]);
           //.separation(separation);

      clearId(root);
      root.children.forEach(collapse);
      update(root);

      function update(source) {
        // Compute the new tree layout.
        //console.log('in update, root is: ', root);
        var nodes = cluster.nodes(root),
            links = cluster.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) {
          // Trying to get optimal depth values
          // Something like this might work for shallow trees:
          d.y = d.depth * 180;
          //if (d.depth < exponentDepth) {
            //d.y = Math.pow(d.depth, 5);
          //} else {
            //d.y = d.depth * 80;
          //}
        });

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function(d) { return d.id || (d.id = ++j); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function(d) {
                return svgTranslate(source.x0, source.y0);
            })
            .on('click', click);
        nodeEnter.append('circle')
            .attr('r', 1e-2)
            .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; });

        nodeEnter.append('text')
            .attr('x', function(d) { return d.childen || d._children ? -10 : 10; })
            .attr('dy', '.35em')
            .attr('text-anchor', function(d) { return d.childen || d._children ? "end" : "start"; })
            .style('text-anchor', 'start')
            .text(function(d) { return d.name; });

        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function(d) {
              return  svgTranslate(d.y, d.x);
            });

        nodeUpdate.select('circle')
            .attr('r', 4.5)
            .style('fill', function(d) {
              return d._children ? "red" : 'lightsteelblue';
            });

        nodeUpdate.select("text")
          .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
              return svgTranslate(source.y, source.x);
            })
            .remove();

        //console.log('node exit: ', nodeExit);

        nodeExit.select("circle")
          .attr("r", 1e-6);

        nodeExit.select("text")
          .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
          .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      // Toggle children on click.
      function click(d) {
        clickCallback.call(clickContext, d);
        console.log('in click, d: ', d);
        toggleChildren(d);
        update(d);
      }
    });
  }

  inner.clickCallback = function(context, callback) {
    if (!arguments.length) { return clickCallback; }
    clickContext = context;
    clickCallback = callback;
    return inner;
  };

  inner.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return inner;
  };

  inner.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return inner;
  };

  inner.separation = function(separationFunction) {
    if (!arguments.length) { return separation; }
    separation = separationFunction;
    return inner;
  };

  inner.diagonal = function(diagonalFunction) {
    if (!arguments.length) { return diagonal; }
    diagonal = diagonalFunction;
    return inner;
  };

  return inner;
}());
export default tree;

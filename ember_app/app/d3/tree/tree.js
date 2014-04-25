import { clearId, collapse, expand, svgRotate, svgTranslate,
  toggleChildren } from './util';

var tree = (function() {
  var width = 1000,
      height = 600,
      duration = 750,
      outerUpdate,
      clickCallback,
      clickContext,
      orientation = 'vertical',
      j = 0,
      separation = function(a, b) {
        return (a.parent === b.parent ? 4 : 8) / a.depth;
      },
      diagonal = d3.svg.diagonal()
        .projection(function(d) {
          if (orientation === 'vertical') {
            return [d.y, d.x];
          } else if (orientation === 'horizontal') {
            return [d.x, d.y];
          }
        }),
      allTreeRoots = [],
      expandAllNodes = function() {
        allTreeRoots.forEach(function(list) {
          var tree = list[0], root = list[1],
              nodes = tree.nodes(root);
          nodes.forEach(function(d) {
            // If it is collapsed, then expand it.
            if (d._children) {
              console.log('expanding d: ', d);
              expand(d);
            }
          });
          outerUpdate(root);
        });
      };

  // Run the visualization
  function inner(selection) {
    selection.each(function(root, i) {
      var svg = d3.select(this).append('svg'),
          svgGroup = svg.append("g"),
          zoomListener;
      root.x0 = height / 2;
      root.y0 = 100;

      svg.attr('width', width)
         .attr('height', height);

      function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        svgGroup.selectAll('g.node').filter(function(d) {
          return d.type === 'directory';
        }).selectAll('text').attr("transform", function(t, i) {
          var s = d3.event.scale, factor = 1, vertOffset = false, translate = 0,
              returnString = '';
          if (s >= 0.9) {
            factor = 1;
          } else if (s >= 0.5) {
            factor = 1.2;
          } else if (s >= 0.4) {
            factor = 1.3;
          } else if (s >= 0.3) {
            factor = 2;
          } else if (s >= 0.2) {
            translate = 2 * -i;
            factor = 3;
          } else {
            translate = 2 * -i;
            factor = 6;
          }
          returnString = "scale(" + factor + ")";
          if (vertOffset) {
            returnString = "scale(" + factor + ")" + "translate(" + translate + ")";
          }
          if (orientation === 'horizontal') {
            returnString += svgRotate(20,0,0);
          }
          return returnString;
        });
      }

      // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
      zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
      svg.call(zoomListener);

      var tree = d3.layout.tree()
           .size([height, width - 160]);
      allTreeRoots.push([tree, root]);

      clearId(root);
      root.children.forEach(collapse);
      update(root);

      function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {
          if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1) {
              levelWidth.push(0);
            }

            levelWidth[level + 1] += n.children.length;
            n.children.forEach(function(d) {
              childCount(level + 1, d);
            });
          }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 35; // 35 pixels per line
        tree = tree.size([newHeight, width * 2]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) {
          if (orientation === 'vertical') {
            d.y = d.depth * 300;
          } else if (orientation === 'horizontal') {
            d.y = d.depth * 300;
            d.x = d.x * 3;
          }
        });

        // Update the nodes...
        var node = svgGroup.selectAll('g.node')
            .data(nodes, function(d) { return d.id || (d.id = ++j); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function(d) {
                return svgTranslate(source.x0, source.y0);
            })
            .on('click', click);
        nodeEnter.append('circle')
            .attr('r', 5)
            .style('fill', function(d) { return d.children || d._children ? 'lightsteelblue' : '#fff'; });

        var textEls = nodeEnter.append('text')
            .attr('x', function(d) { return d.children || d._children ? -5 : 5; })
            .attr('dy', '.35em')
            .attr('text-anchor', function(d) { return d.children || d._children ? "end" : "start"; })
            .text(function(d) { return d.name; });

        if (orientation === 'horizontal') {
          textEls.attr('transform', function(d) { return svgRotate(20,0,0); });
        }

        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function(d) {
              if (orientation === 'vertical') {
                return  svgTranslate(d.y, d.x);
              } else if (orientation === 'horizontal') {
                return  svgTranslate(d.x, d.y);
              }
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
              if (orientation === 'vertical') {
                return  svgTranslate(source.y, source.x);
              } else if (orientation === 'horizontal') {
                return  svgTranslate(source.x, source.y);
              }
            })
            .remove();

        nodeExit.select("circle")
          .attr("r", 1e-6);

        nodeExit.select("text")
          .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
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
      outerUpdate = update;

      // Toggle children on click.
      function click(d) {
        clickCallback.call(clickContext, d, function(newDir) {
          console.log('in d3 tree with newDir: ', newDir);
          toggleChildren(d);
          update(d);
        });
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

  inner.expandAllNodes = function() {
    expandAllNodes();
  };

  return inner;
}());
export default tree;

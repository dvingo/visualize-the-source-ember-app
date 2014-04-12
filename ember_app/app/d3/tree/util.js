// Construct an svg translate string to be used as an attribute value
// of transform.
var svgTranslate = function(x, y) {
  return 'translate(' + x + ',' + y + ')';
};

// Construct an svg rotate string to be used as an attribute value
// of transform.
var svgRotate = function(deg, x, y) {
  return 'rotate(' + deg + ',' + x + ',' + y + ')';
};

// Toggle children.
function toggleChildren(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

// Move the children attribute to another name
// effectively triggering an exit selection.
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

// Clear out id attribute if used by the data
function clearId(d) {
  if (d.children) {
    d.children.forEach(clearId);
  }
  d.emberId = d.id;
  d.id = null;
}

export { clearId, collapse, svgTranslate, svgRotate, toggleChildren };

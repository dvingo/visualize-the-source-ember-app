import forceTree from "../d3/force-tree/force-tree";
export default Em.Component.extend({
  data: null,
  init: function() {
    forceTree.clickCallback(this, this.clickHandler);
    this._super();
  },
  tagName: 'div',
  clickHandler: function(el) {
    console.log("element was clicked: ", el);

    if (el.type === 'directory') {
      this.sendAction('clickedDir', el);
      //this.store.find('directory', el.emberId).then(function(d) {
        //d.reload().then(function(a) { callback(a); });
      //});
    } else if (el.type === 'file') {
      this.sendAction('clickedFile', el);
    }
  },
  update: function(graph) {
    var elementId = '#' + this.get('elementId');
    console.log("graph: ", graph);
    console.log("elementId: ", elementId);
    // TODO replace with Em.isEmpty(root);
    var isEmpty = true;
    for (var key in graph) {
      if (graph.hasOwnProperty(key)) { isEmpty = false; }
    }
    if (!isEmpty) {
      d3.select(elementId).datum(graph).call(forceTree);
    }
  },

  didInsertElement: function() {
    this.valueDidChange();
  },

  dataWillChange: function() {
    console.log('dataWillChange data: ', this.data);
    var elementId = '#' + this.get('elementId') + ' svg';
    console.log('element id selector: ', elementId);
    d3.select(elementId).remove();
  }.observesBefore('data'),

  dataDidChange: function() {
    console.log('dataDidChange data: ', this.data);
  }.observes('data').on('init'),

  valueDidChange: function() {
    console.log('in valueDidChange');
    if (this.update) {
      // this.data is bound from the template.
      this.update(this.data || {});
    }
  }.observes('data')
});

import tree from "../d3/tree/tree";
export default Em.Component.extend({
  tagName: 'div',

  init: function() {
    tree.clickCallback(this, this.clickHandler);
    this._super();
  },

  clickHandler: function(el, callback) {
    if (el.type === 'directory') {
      this.sendAction('clickedDir', el);
      //this.store.find('directory', el.emberId).then(function(d) {
        //d.reload().then(function(a) { callback(a); });
      //});
      callback(el);
    } else if (el.type === 'file') {
      this.sendAction('clickedFile', el);
    }
  },

  update: function(root) {
    var elementId = '#' + this.get('elementId');
    // TODO replace with Em.isEmpty(root);
    var isEmpty = true;
    for (var key in root) {
      if (root.hasOwnProperty(key)) { isEmpty = false; }
    }
    if (!isEmpty) {
      d3.select(elementId).datum(root).call(tree);
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
  }.observes('data'),

  actions: {
    expandAllNodes: function() {
      console.log('expand all nodes');
      tree.expandAllNodes();
    }
  }

});

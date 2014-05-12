export default Em.Mixin.create({
  children: DS.hasMany('child', {polymorphic: true, async: true, inverse: 'parent'}),
  type: DS.attr('string'),

  hasChildren: function() {
    var children = this.get('children');
    if (children) {
      return children.get('length') > 0;
    }
    return false;
  }.property('children.@each'),

  isLeaf: function() {
    var children = this.get('children');
    if (children) {
      return children.get('length') === 0;
    }
    return true;
  }.property('children.@each')

});

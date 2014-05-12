export default Em.Mixin.create({
  parent: DS.belongsTo('parent', {polymorphic: true, inverse: 'children'}),
  type: DS.attr('string')
});

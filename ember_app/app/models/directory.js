var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

var Directory = DS.Model.extend({
  name: attr('string'),
  d3Data: attr()
});

export default Directory;

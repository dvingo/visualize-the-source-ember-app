import Parent from './parent';
var attr = DS.attr;

var Project = DS.Model.extend({
  name: attr('string')
});
export default Project;

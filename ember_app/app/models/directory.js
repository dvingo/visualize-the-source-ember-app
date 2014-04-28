import Parent from './parent';
import Child from './child';
var attr = DS.attr;

var Directory = DS.Model.extend(Parent, Child, {
  name: attr('string'),
  d3TreeData: attr(),
  d3ForceTreeData: attr()
});
export default Directory;

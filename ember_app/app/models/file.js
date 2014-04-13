import Child from './child';
var attr = DS.attr;
var File = DS.Model.extend(Child, {
  name: attr('string'),
  content: attr('string')
});
export default File;

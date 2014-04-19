export default Em.ObjectController.extend({
  selectedFileContent: null,
  selectedFileName: null,
  actions: {
    showFile: function(file) {
      if (file.type === 'file') {
        this.set('selectedFileName', file.name);
        this.set('selectedFileContent', file.content);
      }
    }
  }
});

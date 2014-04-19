export default Em.ObjectController.extend({
  selectedFileOneContent: null,
  selectedFileOneName: null,
  selectedFileTwoContent: null,
  selectedFileTwoName: null,
  useLeftPane: true,

  actions: {
    showFile: function(file) {
      if (file.type === 'file') {
        if (this.get('useLeftPane')) {
          this.set('selectedFileOneName', file.name);
          //this.set('selectedFileOneContent', Em.String.htmlSafe(file.content.replace(/\n/g, '<br>')));
          this.set('selectedFileOneContent', file.content);
          this.toggleProperty('useLeftPane');
        } else {
          this.set('selectedFileTwoName', file.name);
          //this.set('selectedFileTwoContent', Em.String.htmlSafe(file.content.replace(/\n/g, '<br>')));
          this.set('selectedFileTwoContent', file.content);
          this.toggleProperty('useLeftPane');
        }
      }
    }
  }

});

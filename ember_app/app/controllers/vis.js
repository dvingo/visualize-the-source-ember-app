export default Em.ObjectController.extend({
  selectedFileOneContent: null,
  selectedFileOneName: null,
  selectedFileTwoContent: null,
  selectedFileTwoName: null,
  useLeftPane: true,

  actions: {
    showFile: function(file) {
      var self = this, newContent;
      if (file.type === 'file') {
        if (this.get('useLeftPane')) {
          this.set('selectedFileOneName', file.name);
          //Em.run(function() {
            //$('.file.left pre code').removeClass();
          newContent = hljs.highlight('javascript', file.content);
          self.set('selectedFileOneContent', newContent.value);

            //$('.file.left pre code').each(function(i, e) { hljs.highlightBlock(e); });
          //});
          this.toggleProperty('useLeftPane');
        } else {
          this.set('selectedFileTwoName', file.name);
          //Em.run(function() {
            //$('.file.right pre code').removeClass();
          newContent = hljs.highlight('javascript', file.content);
          self.set('selectedFileTwoContent', newContent.value);
            //$('.file.right pre code').each(function(i, e) { hljs.highlightBlock(e); });
          //});
          this.toggleProperty('useLeftPane');
        }
      }
    }
  }

});

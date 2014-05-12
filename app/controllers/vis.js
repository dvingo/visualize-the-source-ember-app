export default Em.ObjectController.extend({
  showTree: true,
  selectedFileOneContent: null,
  selectedFileOneName: null,
  selectedFileTwoContent: null,
  selectedFileTwoName: null,
  useLeftPane: true,

  actions: {
    displayFile: function(file) {
        var newContent;
        if (file.get('type') === 'file') {
          if (this.get('useLeftPane')) {
            this.set('selectedFileOneName', file.get('name'));
            newContent = hljs.highlight('javascript', file.get('content'));
            this.set('selectedFileOneContent', newContent.value);
            this.toggleProperty('useLeftPane');
          } else {
            this.set('selectedFileTwoName', file.get('name'));
            newContent = hljs.highlight('javascript', file.get('content'));
            this.set('selectedFileTwoContent', newContent.value);
            this.toggleProperty('useLeftPane');
          }
        }
    },
    expandDir: function(dir) {
      //this.store.find('directory', dir.emberId).then(function(d) {
        //console.log('expand DS dir: ', d);
      //});
      console.log('expand dir: ', dir);
    },
    showFile: function(el) {
      var self = this;
      this.store.find('file', el.emberId).then(function(f) {
        if (f.get('content') !== '') {
          self.send('displayFile', f);
          return;
        }
        f.reload().then(function(file) {
          self.send('displayFile', file);
        });
      });
    },
    toggleVisType: function() {
      this.toggleProperty('showTree');
    }
  }

});

Visualize and browse the Ember.js source code in a D3 powered tree.

# Todo

Have the ember app request /api/directories/getRoot
which will find the root of the ember source and return the tree.

# Quick start

Assumees Neo4j is installed

```bash
git clone https://github.com/emberjs/ember.js.git
cd ember.js
rm -rf .git
cd ..
python import_data.py
cd express_app && npm install && node app &
cd ..
cd ember_app && npm install
grunt server
```

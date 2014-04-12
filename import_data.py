import os
import py2neo
import sys

from py2neo import node, neo4j, rel

graph_db = neo4j.GraphDatabaseService("http://localhost:7474/db/data/")

path = './ember.js'
current_root = None

def create_dir_children(dirs, parent):
    '''Create the following relationship: (p:Directory)<-[:PARENT]-(d:Directory)
    where dirs is a list of strings and parent is a py2neo node.'''
    print 'creating parent child rel: '
    print 'parent: ', parent.get_properties()
    print 'dirs: ', dirs
    print
    for d in dirs:
        dir_node = graph_db.create({'name': d})[0]
        dir_node.add_labels('Directory')
        graph_db.create(rel(dir_node, "PARENT", parent))

def create_file_children(files, parent):
    for f in files:
        file_node = graph_db.create({'name': f})[0]
        file_node.add_labels('File')
        graph_db.create(rel(file_node, "PARENT", parent))

def create_dir_node(name):
    dir_node = graph_db.create({'name': name})[0]
    dir_node.add_labels('Directory')
    return dir_node

def get_node_from_parent(name, parent_node):
    children = list(parent_node.match_incoming(rel_type="PARENT"))
    matched = filter(lambda x: x.start_node['name'] == name, children)
    if len(matched):
        return matched[0].start_node

previous_parent = None
for root, dirs, files in os.walk(path, topdown=True):
    root_name = os.path.basename(root)
    if current_root is None:
        print 'creating root'
        current_root = create_dir_node(root_name)
        previous_parent = current_root
    else:
        print 'getting exisisting parent: for root_name: ', root_name
        current_root = get_node_from_parent(root_name, current_root)
    if current_root is None:
        current_root = previous_parent
        previous_parent = current_root
        continue
    create_dir_children(dirs, current_root)
    create_file_children(files, current_root)
    sys.exit()

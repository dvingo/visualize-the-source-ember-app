# -*- coding: utf-8 -*-
import os
import py2neo
import uuid

from py2neo import node, neo4j, rel
from py2neo.neo4j import WriteBatch

def create_directory_children(dirs, parent):
    '''Create the following relationship: (p:Directory)<-[:PARENT]-(d:Directory)
    where dirs is a list of strings and parent is a py2neo node.'''
    batch = WriteBatch(graph_db)
    for d in dirs:
        dir_node = batch.create({'name': d, '_id': uuid.uuid4().hex})
        batch.add_labels(dir_node, "Directory")
        batch.create(rel(dir_node, "PARENT", parent))
    batch.run()

def create_file_children(files, parent, root_path):
    '''Create (p:Directory)<-{:PARENT]-(f:File)
    for all files to the given parent. Also stores the file's contents in
    the content property.'''
    batch = WriteBatch(graph_db)
    for f in files:
        file_content = get_file_content(f, root_path)
        file_node = batch.create({'name': f, '_id': uuid.uuid4().hex,
            'content': file_content})
        batch.add_labels(file_node, 'File')
        batch.create(rel(file_node, "PARENT", parent))
    batch.run()

def get_file_content(filename, root_path):
    path_name = os.path.join(root_path, filename)
    try:
        file_obj = open(path_name)
        lines = u''.join([line.decode('utf-8').strip() for line in file_obj.readlines()])
    except:
        print 'got error'
        print 'reading content for file: ', path_name
        print 'root path: ', root_path
        return ''
    return lines

def create_directory_node(name):
    dir_node = graph_db.create({'name': name, '_id': uuid.uuid4().hex})[0]
    dir_node.add_labels('Directory')
    return dir_node

def get_node_from_parent(name, parent_node):
    children = list(parent_node.match_incoming(rel_type="PARENT"))
    matched = filter(lambda x: x.start_node['name'] == name, children)
    if len(matched):
        return matched[0].start_node

def get_node_from_ancestor_stack(full_path_name, name, ancestor_stack):
    '''Finds an existing node in Neo4j for the given name from the list
    of ancestors which are py2neo node objects.'''
    existing_node = None
    while existing_node is None:
        ancestor_stack.pop()
        if not len(ancestor_stack):
            break
        temp_node = get_node_from_parent(name, ancestor_stack[-1])
        if temp_node and path_matches_file_system(full_path_name, ancestor_stack):
            existing_node = temp_node
    return existing_node

def path_matches_file_system(file_path_name, ancestor_list):
    ancestor_fs_path = os.path.join(
        *map(lambda x: x.get_properties()['name'], ancestor_list))
    file_dirname = os.path.dirname(file_path_name)
    return  os.path.samefile(file_dirname, ancestor_fs_path)

graph_db = neo4j.GraphDatabaseService("http://localhost:7474/db/data/")
path = './ember.js'
current_root = None
previous_parent = None
parent_stack = []
num_dirs = 0
num_files = 0
print 'Inserting data...'
for root, dirs, files in os.walk(path, topdown=True):
    root_name = os.path.basename(root)
    if current_root is None:
        current_root = create_directory_node(root_name)
        previous_parent = current_root
    else:
        current_root = get_node_from_parent(root_name, current_root)
        if current_root is None:
            current_root = get_node_from_ancestor_stack(root, root_name, parent_stack)
    parent_stack.append(current_root)
    num_dirs += len(dirs)
    num_files += len(files)
    create_directory_children(dirs, current_root)
    create_file_children(files, current_root, root)
print "Created {} directories".format(num_dirs)
print "Created {} files".format(num_files)

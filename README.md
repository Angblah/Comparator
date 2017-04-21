# Comparator

Comparator is a web app that allows users to easily compare products to determine the one to best fit their needs.

<b>Release Notes version 1.0</b>

NEW FEATURES
  Added functionality to create and edit templates
  Added functionality to create and edit comparisons
  Added feature to share comparisons
  Added button to export comparison
  Added functionality to save as template or comparison
  
BUG FIXES
  Clicking on but not changing values in the comparison no longer triggers Undo/Redo

KNOWN BUGS
  When downloading as xlsx, empty items will show up as " " instead of ""

<b>Install Guide version 1.0</b>

PRE-REQUISITES
  Install Python 3
  Install Node Package Manager

DEPENDENCIES
run "pip install -r requirements.txt"
run "npm install"
run "npm i webpack -g"
run "npm install -g less"

DOWNLOAD
  github.com/Angblah/The-Comparator

BUILD
  To compile the .jsx into the bundles, run "webpack" from the root directory
  To compile the .less into .css files, run "lessc [filename].less [filename].css" from css folder  
  
INSTALLATION
  Contact Team 171 Byte Me for information on sensitive environment variables.
  
RUNNING APPLICATION
  Run "python app.py" in a terminal to run locally

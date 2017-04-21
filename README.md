# Comparator

Comparator is a web app that allows users to easily compare products to determine the one to best fit their needs.

Release Notes version 1.0
NEW FEATURES
  Added functionality to create and edit templates
  Added functionality to create and edit comparisons
  Added feature to share comparisons
  Added button to export comparison
  Added functionality to save as template or comparison
  
BUG FIXES
  Clicking on an empty cell in the comparison no longer triggers Undo/Redo

KNOWN BUGS
  When downloading as xlsx, empty items will show up as " " instead of ""

To install packages:
  1. Install Git
  2. Install Node Package Manager
  3. run "pip install -r requirements.txt"
  4. run "npm install"
  5. run "npm i webpack -g"
    - To compile the .jsx into the bundles, run "webpack" from the root directory
  6. run "npm install -g less"
    - To compile the .less into .css files, run "lessc [filename].less [filename].css" from css folder

# Comparator

Comparator is a web app that allows users to easily compare products to determine the one to best fit their needs.

<b>Release Notes version 1.0</b>

NEW FEATURES<br>
  * Added functionality to create and edit templates<br>
  * Added functionality to create and edit comparisons<br>
  * Added feature to share comparisons<br>
  * Added button to export comparison<br>
  * Added functionality to save as template or comparison<br>
  
BUG FIXES<br>
  * Clicking on but not changing values in the comparison no longer triggers Undo/Redo<br>

KNOWN BUGS<br>
  * When downloading as xlsx, empty items will show up as " " instead of ""<br>
  * Changes that are being made during the database call completion may get lost in front-end rerender

<b>Install Guide version 1.0</b><br>

PRE-REQUISITES<br>
  * Install Python 3<br>
  * Install Node Package Manager<br>

DEPENDENCIES<br>
1. run "pip install -r requirements.txt"<br>
2. run "npm install"<br>
3. run "npm i webpack -g"<br>
4. run "npm install -g less"<br>

DOWNLOAD<br>
  github.com/Angblah/The-Comparator<br>

BUILD<br>
 1. To compile the .jsx into the bundles, run "webpack" from the root directory<br>
 2. To compile the .less into .css files, run "lessc [filename].less [filename].css" from css folder<br>
  
INSTALLATION<br>
  Contact Team 171 Byte Me for information on sensitive environment variables.<br>
  
RUNNING APPLICATION<br>
  Run "python app.py" in a terminal to run locally<br>

TROUBLESHOOTING<br>
  We have added React-logger to the front-end in order to allow for easy troubleshooting on the front-end
  

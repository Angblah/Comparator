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
  * Guests can no longer edit any comparison they are given links to
  * Users can create comparisons by importing csv/xls/xlsx files

KNOWN BUGS<br>
  * When downloading as csv, empty items will show up as " " instead of ""
  * Changes that are being made during the database call completion may get lost in front-end rerender
  * All database calls may be vulnerable to javascript injection (while queries are parameterized, there is no server-side check for whether a user is allowed to call a function, which could allow malicious users to affect other users' data). CSRF tokens are also not yet used.

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
  Contact Team 171 Byte Me for information on sensitive environment variables.
  These variables control access to various data storage locations and are as follows:
   * CLOUDINARY_API_KEY
   * CLOUDINARY_API_SECRET
   * CLOUDINARY_CLOUD_NAME
   * DATABASE_URL
   * SECRET_KEY
   * SENDGRID_API_KEY
  
  Alternatively, create your own Cloudinary account/Postgresql database/Sendgrid account and set these environmental variables accordingly.<br>
  
RUNNING APPLICATION<br>
  Run "python app.py" in a terminal to run locally<br>

TROUBLESHOOTING<br>
  We have added React-logger to the front-end in order to allow for easy troubleshooting on the front-end
  

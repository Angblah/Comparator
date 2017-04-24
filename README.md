# Comparator

Comparator is a web app that allows users to easily compare products to determine the one to best fit their needs. It is currently hosted on Heroku at http://thecomparator.herokuapp.com/.

<b>Release Notes version 1.0</b>

NEW FEATURES<br>
  * Added functionality to create and edit templates<br>
  * Added functionality to create and edit comparisons<br>
  * Added feature to share comparisons<br>
  * Added button to export comparison<br>
  * Added functionality to save as template or comparison<br>
  * Added functionality to create comparisons by importing csv/xls/xlsx files<br>
  * Added functionality to create new empty comparisons/templates quickly on dashboard<br>
  * Added functionality to search through comparisons/templates on dashboard<br>
  
BUG FIXES<br>
  * Clicking on but not changing values in the comparison no longer triggers Undo/Redo<br>
  * Guests can no longer edit any comparison they are given links to

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
  Contact Team 171 Byte Me for information on sensitive environment variables which must be set to use the application.
  Most of these variables control access to various data storage locations and are as follows:
  
   * CLOUDINARY_API_KEY
   * CLOUDINARY_API_SECRET
   * CLOUDINARY_CLOUD_NAME
   * DATABASE_URL
   * SECRET_KEY
   * SENDGRID_API_KEY
  
  These keys are not exposed here for security reasons. Additionally, SendGrid, our email service, periodically scans github for exposed keys and will disable accounts if they are found. If you do not wish to contac us, you can create your own Cloudinary account/Postgresql database/SendGrid account and set these environmental variables accordingly. The SECRET_KEY may be any sufficiently long random string, so long as it remains constant. It is used for various encryption tasks. <br>
  
RUNNING APPLICATION<br>
  Run "python app.py" in a terminal to run locally<br>

TROUBLESHOOTING<br>
  We have added React-logger to the front-end in order to allow for easy troubleshooting on the front-end
  

from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
import os

app = Flask(__name__)
# TODO: fetch credentials instead of using string as credentials can change under some circumstances (see https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku)
app.config[
    'SQLALCHEMY_DATABASE_URI'] = "postgres://inpbjnlkzqdkhf:d0a646187c72013be9247400d3abe35c4f3f0360ce657260758c455c9c147cf3@ec2-54-163-234-20.compute-1.amazonaws.com:5432/dfu8hu14lo03hn"
# "postgres://postgres:byteme@localhost/the-comparator"
app.debug = True
app.test_request_context().push()
db = SQLAlchemy(app)

from models import *
from database_utils import validate_login, validate_registration, register_user


@app.route('/')
def index():
    if not session.get('logged_in'):
        # If not currently logged in, show the home screen
        return render_template('home.html')
    else:
        # If logged in, show workspace
        return render_template('profileHomePage.html')


@app.route('/newComparison')
def newComparison():
    if not session.get('logged_in'):
        return redirect(url_for('index'))
    else:
        return render_template('newComparison.html')


# TODO: rename register and add_user functions to reduce confusion
@app.route('/profile')
def register():
    if not session.get('logged_in'):
        # If you're not logged in, you shouldn't be able to access this page
        return redirect(url_for('index'))
    else:
        return render_template('profileHomePage.html', username=request.args.get('username'))


@app.route('/add_user', methods=['POST'])
def add_user():
    # Create the object we want to add
    # user = Account(request.form['email'], request.form['username'], request.form['password'])
    input = (request.form['email'], request.form['username'], request.form['password'])
    temp = validate_registration(input[0], input[1])
    if temp == 1:
        # TODO: Display registration confirmation
        register_user(input[0], input[1], input[2])
        a = 1
    elif temp == 2:
        # TODO: display duplicate email

        a = 1
    elif temp == 3:
        # TODO: display duplicate username
        a = 1
    return redirect(url_for('index'))


@app.route('/login', methods=['POST'])
def login():
    loginUsername = request.form['username']
    loginPassword = request.form['password']
    if validate_login(loginUsername, loginPassword):
        # Login successful
        session['logged_in'] = True
        return redirect(url_for('register', username=loginUsername))
    else:
        # Login unsuccessful
        return redirect(url_for('index'))


@app.route("/logout")
def logout():
    session['logged_in'] = False
    return render_template('home.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', port=port, debug=True)

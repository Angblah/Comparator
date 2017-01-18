from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://postgres:byteme@localhost/the-comparator"
app.debug = True
db = SQLAlchemy(app)

from models import *

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/newComparison')
def newComparison():
    return render_template('newComparison.html')

@app.route('/register')
def register():
	return render_template('register.html')

@app.route('/add_user', methods=['POST'])
def add_user():
	#Create the object we want to add
	user = Account(request.form['email'], request.form['username'], request.form['password'])
	#Add the user to the database
	db.session.add(user)
	db.session.commit()
	return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
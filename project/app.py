from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://inpbjnlkzqdkhf:d0a646187c72013be9247400d3abe35c4f3f0360ce657260758c455c9c147cf3@ec2-54-163-234-20.compute-1.amazonaws.com:5432/dfu8hu14lo03hn"
#"postgres://postgres:byteme@localhost/the-comparator"
app.debug = True
db = SQLAlchemy(app)

a = 1
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
	port = int(os.environ.get('PORT', 5000))
	print port
	app.run(host='0.0.0.0', port=port, debug=True)
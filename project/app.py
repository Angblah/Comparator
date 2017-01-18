from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

from flask.ext.heroku import Heroku

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://wkwgmorgzmgqal:7006e7788fd04d1bf0a59d8dee3484fb6543b6acb3eba5fa5cdcad7129f53ca5@ec2-54-243-185-99.compute-1.amazonaws.com:5432/d8e0903afn75gv"
heroku = Heroku(app)
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
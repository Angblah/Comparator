from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://miqbdmjyscatvg:a03a7876aa7a369135108a5506e59a103d918f89c0a5205cade34102fb12197a@ec2-54-225-66-44.compute-1.amazonaws.com:5432/d9pjg2jcqiqq1q"
#"postgres://postgres:byteme@localhost/the-comparator"
app.debug = True
db = SQLAlchemy(app)
db.create_all()

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
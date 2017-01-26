from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import os
import sendgrid
from sendgrid.helpers.mail import *
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
# TODO: fetch credentials instead of using string as credentials can change under some circumstances (see https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku)
app.config[
    'SQLALCHEMY_DATABASE_URI'] = "postgres://inpbjnlkzqdkhf:d0a646187c72013be9247400d3abe35c4f3f0360ce657260758c455c9c147cf3@ec2-54-163-234-20.compute-1.amazonaws.com:5432/dfu8hu14lo03hn"
app.debug = True
app.test_request_context().push()
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
# TODO: make actual secret key for app.config
ts = URLSafeTimedSerializer('a really bad secret key')

from models import *
from database_utils import *


@app.route('/')
def index():
    return render_template('home.html')

@login_manager.user_loader
def load_user(user_id):
    #Given user_id, return the associated User object
    return Account.query.filter_by(username = user_id).one()

@app.route('/newComparison')
def newComparison():
    return render_template('newComparison.html')


# TODO: rename register and add_user functions to reduce confusion
@app.route('/profile')
@login_required
def profile_page():
    return render_template('profileHomePage.html')

@app.route('/myProfile')
@login_required
def myProfile_page():
    return render_template('myProfile.html', username=request.args.get('username'))

@app.route('/forgotPassword')
def forgotPassword():

    return render_template('forgotPassword.html')

@app.route('/reset_password', methods=['POST'])
def reset_password():
    # TODO: change api key and move to env variable near final deploy
    email_or_username = request.form['email_or_username']
    try:
        user = Account.query.filter_by(username =email_or_username).one()
    except NoResultFound:
        #Search the email column
        try:
            user = Account.query.filter_by(email=email_or_username).one()
        except NoResultFound:
            #User not found, inform guest user
            print ("Not found")
            #TODO:: How to show the user invalid message
            return ('', 204)

    #User is populated at this point, grab email to send email to
    token = ts.dumps(user.email, salt='recover-key')
    recover_url = url_for('reset_with_token', token=token, _external=True)


    sg = sendgrid.SendGridAPIClient(apikey="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")
    from_email = Email("admin@thecomparator.herokuapp.com")
    to_email = Email(user.email)
    subject = "TheComparator: Forgot your password?"
    content = Content("text/plain", "Follow this link to reset your password: " + recover_url)
    mail = Mail(from_email, subject, to_email, content)
    response = sg.client.mail.send.post(request_body=mail.get())

    # print(response.status_code)
    # print(response.body)
    # print(response.headers)
    # TODO: response once email submitted (e.g. "email has been sent with reset link, please wait ..."
    return ('', 204)

@app.route('/reset/<token>', methods=["GET", "POST"])
def reset_with_token(token):
    try:
        # link expires after 24 hours (86400 seconds)
        email = ts.loads(token, salt="recover-key", max_age=86400)
    except:
        # TODO: invalid link message
        print('invalid link')

    if request.method == 'POST':
        user = Account.query.filter_by(email=email).first_or_404()
        set_password(user.id, request.form['password'])
        # TODO: successful password reset message + go to another page?

    return render_template('reset_with_token.html', token=token)

@app.route('/add_user', methods=['POST'])
def add_user():
    # Create the object we want to add
    # user = Account(request.form['email'], request.form['username'], request.form['password'])
    input = (request.form['email'], request.form['username'], request.form['password'], request.form['password_confirm_register'])
    # TODO: prettier form validation
    if input[2] != input[3]:
        flash('Passwords must match.', 'password_error')
    else:
        temp = validate_registration(input[0], input[1])
        if temp == 1:
            register_user(input[0], input[1], input[2])
            return login_helper(input[1], input[2])
        elif temp == 2:
            flash('This email is already attached to an account.', 'email_error')
        elif temp == 3:
            flash('This username is taken. Please try another.', 'username_error')
    return redirect(url_for('index'))


@app.route('/login')
def login():
    data = {}
    loginUsername = request.args.get('loginUsername')
    loginPassword = request.args.get('loginPassword')

    if validate_login(loginUsername, loginPassword):
        # Login successful
        user = Account.query.filter_by(username = loginUsername).one()
        login_user(user, remember=True)

        data['redirect'] = 'profile'
        return jsonify(data)
    else:
        # Login unsuccessful
        data['success'] = "We couldn't find that username and password."
        return jsonify(data)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return render_template('home.html')

# @app.route('/forgot_password', methods=['POST'])
# def forgot_password():
#     emailOrUsername = request.form['emailOrUsername']
#     #Search the username column first
#     try:
#         user = Account.query.filter_by(username = emailOrUsername).one()
#     except NoResultFound:
#         #Search the email column
#         try:
#             user = Account.query.filter_by(email=emailOrUsername).one()
#         except NoResultFound:
#             #User not found, inform guest user
#             print ("Not found")
#             #TODO:: How to show the user invalid message
#             return ('', 204)
#
#     #User is populated at this point, grab email to send email to
#     print ("Username or email found! Mail will be sent")
#     #user.email
#     #TODO:: Implement sending mail to user
#     return ('', 204)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', port=port, debug=True)

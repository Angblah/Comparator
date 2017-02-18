from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import os
import sendgrid
from sendgrid.helpers.mail import *
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
app.config[
    'SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.debug = True
app.test_request_context().push()
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
ts = URLSafeTimedSerializer(app.config['SECRET_KEY'])

from models import *
from database_utils import *

@app.route('/')
def index():
    return render_template('home.html')

@login_manager.user_loader
def load_user(user_id):
    #Given user_id, return the associated User object
    return Account.query.filter_by(username=user_id).one()

@app.route('/getComparisonData')
def getComparisonData():
    data = get_comparison(1)
    return (data)

@app.route('/newComparison')
def newComparison():
    return render_template('newComparison.html')

#TODO:: Pass in template/comparison_id from Select a Template/Comparison
@app.route('/workspace')
def workspace():
    # TODO: get template of current user, current function displays a template of admin (change when user can choose template on screen)
    template = get_template(1)
    comparison = get_comparison(1)

    return render_template('workspace.html', template=template, comparison=comparison)
    
@app.route('/testbed')
def testbed():
    return render_template('testbed.html')

@app.route('/index')
def index2():
    return render_template('index.html')

@app.route('/profile')
@login_required
def profile_page():
    
    namelist = get_user_comparison_names(current_user.id)

    return render_template('profileHomePage.html', name_list=namelist)

@app.route('/myProfile')
@login_required
def myProfile_page():
    return render_template('myProfile.html')

@app.route('/forgotPassword')
def forgotPassword():
    return render_template('forgotPassword.html')

@app.route('/reset_password')
def reset_password():
    data = {}

    emailOrUsername = request.args.get('emailOrUsername')
    try:
        user = Account.query.filter_by(username=emailOrUsername).one()
    except NoResultFound:
        #Search the email column
        try:
            user = Account.query.filter_by(email=emailOrUsername).one()
        except NoResultFound:
            #User not found, inform guest user
            data['error'] = "We couldn't find an associated email address."
            return jsonify(data)

    #User is populated at this point, grab email to send email to
    token = ts.dumps(user.email, salt='recover-key')
    recover_url = url_for('reset_with_token', token=token, _external=True)


    sg = sendgrid.SendGridAPIClient(apikey=os.environ['SENDGRID_API_KEY'])
    from_email = Email("admin@thecomparator.herokuapp.com")
    to_email = Email(user.email)
    subject = "TheComparator: Forgot your password?"
    content = Content("text/plain", "Follow this link to reset your password: " + recover_url)
    mail = Mail(from_email, subject, to_email, content)
    response = sg.client.mail.send.post(request_body=mail.get())

    data['success'] = "You'll receive an email with a link to reset your password shortly."
    return jsonify(data)

@app.route('/reset/<token>', methods=["GET", "POST"])
def reset_with_token(token):
    change_success = False
    password_valid = True
    try:
        # link expires after 24 hours (86400 seconds)
        email = ts.loads(token, salt="recover-key", max_age=86400)
        valid_link = True
    except:
        valid_link = False

    if request.method == 'POST':
        user = Account.query.filter_by(email=email).first_or_404()
        password = request.form['password']
        if len(password) == 0:
            password_valid = False
        else:
            set_password(user.id, password)
            change_success = True

    return render_template('reset_with_token.html', token=token, valid_link=valid_link, change_success=change_success, password_valid=password_valid)

# TODO: consider adding requirements to password (length, character types, etc.)
@app.route('/add_user')
def add_user():
    data = {}
    registerEmail = request.args.get('registerEmail')
    registerUsername = request.args.get('registerUsername')
    registerPassword = request.args.get('registerPassword')
    registerPasswordConfirm = request.args.get('registerPasswordConfirm')

    #Make sure the username and email are available
    emailCheck = ""
    usernameCheck = ""

    try:
        emailCheck = Account.query.filter_by(email=registerEmail).one()
    except NoResultFound:
        pass

    try:
        usernameCheck = Account.query.filter_by(username=registerUsername).one()
    except NoResultFound:
        pass

    if emailCheck and usernameCheck:
        data['errorEmailUsername'] = "The email and username are already registered with an account."
    elif emailCheck:
        data['errorEmail'] = "The email is already registered with an account."
    elif usernameCheck:
        data['errorUsername'] = "The username is already registered with an account."

    if data:
        return jsonify(data)
    else:
        # data is empty, no duplicate usernames/emails
        register_user(registerEmail, registerUsername, registerPassword)
        return login_helper(registerUsername, registerPassword)

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
        data['error'] = "We couldn't find that username and password."
        return jsonify(data)

def login_helper(loginUsername, loginPassword):
    data = {}

    if validate_login(loginUsername, loginPassword):
        # Login successful
        user = Account.query.filter_by(username = loginUsername).one()
        login_user(user, remember=True)

        data['redirect'] = 'profile'
        return jsonify(data)
    else:
        # Login unsuccessful
        data['error'] = "We couldn't find that username and password."
        return jsonify(data)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return render_template('home.html')


# TODO: integrate into workspace once that's set up
# Taken from https://github.com/cloudinary/pycloudinary/tree/master/samples/basic_flask (remove/adapt later for workspace)
@app.route('/image_upload_example', methods=['GET', 'POST'])
def upload_file():
    from flask import request, render_template
    from cloudinary.uploader import upload
    from cloudinary.utils import cloudinary_url

    upload_result = None
    thumbnail_url1 = None
    thumbnail_url2 = None
    if request.method == 'POST':
        file_to_upload = request.files['file']
        if file_to_upload:
            upload_result = upload(file_to_upload)
            thumbnail_url1, options = cloudinary_url(upload_result['public_id'], format="jpg", crop="fill", width=100,
                                                     height=100)
            thumbnail_url2, options = cloudinary_url(upload_result['public_id'], format="jpg", crop="fill", width=200,
                                                     height=100, radius=20, effect="sepia")
    return render_template('upload_form.html', upload_result=upload_result, thumbnail_url1=thumbnail_url1,
                           thumbnail_url2=thumbnail_url2)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', port=port, debug=True)

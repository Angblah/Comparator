from flask import Flask, render_template, request, url_for, jsonify, abort, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.orm.exc import NoResultFound
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import os
import sendgrid
from sendgrid.helpers.mail import *
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
app.config[
    'SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.debug = True
app.test_request_context().push()
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
ts = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# max user cloudinary image storage in bytes
# currently 10 mebibytes
MAX_USER_IMAGE_STORAGE = 10 * 1024 ** 2

from models import *
from database_utils import *


@app.route('/')
def index():
    if current_user.is_anonymous:
        sample_temp = get_sample_templates()
        return render_template('home.html', sample_temp=sample_temp)
    else:
        return redirect(url_for('dashboard'))


@login_manager.user_loader
def load_user(user_id):
    # Given user_id, return the associated User object
    return Account.query.filter_by(id=user_id).one()


@login_required
@app.route('/uploadAvatar', methods=["POST"])
def uploadAvatar():
    from cloudinary.uploader import upload, destroy
    from secrets import randbits
    from sys import getsizeof
    from flask import jsonify

    data = {}

    if request.method == 'POST':
        # TODO: consider testing if file is image (though cloudinary technically does this anyway)
        file_to_upload = request.data

        if file_to_upload:
            file_size = getsizeof(file_to_upload)
            user_storage_use = get_user_image_storage_size(current_user.id)
            if file_size + user_storage_use > MAX_USER_IMAGE_STORAGE:
                # image upload cancelled as exceeds max user image storage size
                message = 'Upload exceeds your max image storage size, {} bytes. {} bytes currently used. (Uploaded image is {} bytes.)'.format(
                    MAX_USER_IMAGE_STORAGE, user_storage_use, file_size)
                data['failure'] = message
            else:
                # NOTE: public_id not replaced as cached images take a while to clear from CDN, new avatar may not appear
                filepath = 'users/' + str(current_user.id) + '/avatar/' + str(randbits(32))
                upload_result = upload(file=file_to_upload, public_id=filepath)
                image_id = upload_result['public_id']

                query = text("""
                select avatar from account where id = :account_id;
                """)

                old_avatar_id = db.engine.execute(query, account_id=current_user.id).scalar()
                if old_avatar_id:
                    destroy(old_avatar_id, invalidate=True)

                query = text("""
                update account set avatar = :image_id where id = :account_id;
                """)
                db.engine.execute(query.execution_options(autocommit=True), image_id=image_id,
                                  account_id=current_user.id)
                data['success'] = image_id
        return jsonify(data)


# returns total image size in bytes of all of the specified user's cloudinary images
def get_user_image_storage_size(id):
    return get_cloudinary_folder_size('users/' + str(id))


def get_cloudinary_folder_size(path):
    from cloudinary.api import resources
    size = 0
    for resource in resources(type="upload", prefix=path)['resources']:
        size += resource['bytes']
    return size


@login_required
@app.route('/getUserAvatarID', methods=["GET", "POST"])
def getUserAvatarID():
    query = text("""
    select avatar from Account where id = :id;
    """)
    return json.dumps(db.engine.execute(query, id=current_user.id).scalar())


@app.route('/ComparisonFromTemplate', methods=["POST"])
def comparisonFromTemplate():
    template_id = int(request.values['id'])

    # If it is a comparison from guest user, assign it to guest's account
    if current_user.is_anonymous:
        comparison_id = create_comparison_from_template(2, template_id)
        return redirect(share_comparison(comparison_id, 2))
    else:
        comparison_id = create_comparison_from_template(current_user.id, template_id)
        return redirect(share_comparison(comparison_id, current_user.id))


@app.route('/getComparisonData')
def getComparisonData():
    data = get_comparison(12)
    return data


@app.route('/editComparisonName', methods=["POST"])
def editComparisonName():
    message = {}
    data = json.loads(request.data)
    set_sheet_name(data['compId'], data['name'])
    message['success'] = 'success'
    return jsonify(message)


@app.route('/editItemWorth', methods=["POST"])
def editItemWorth():
    message = {}
    data = json.loads(request.data)
    set_attribute_value_worth(data['itemId'], data['attrId'], data['worth'])
    message['success'] = 'success'
    return jsonify(message)


@app.route('/saveComparisonAttributesData', methods=["POST"])
def saveComparisonAttributesData():
    message = {}
    data = json.loads(request.data)
    message['id'] = data['id']
    message['name'] = data['name']
    set_sheet_attribute_field(data['id'], 'name', data['name'])
    return jsonify(message)


@app.route('/saveComparisonData', methods=["POST"])
def saveComparisonData():
    message = {}
    data = json.loads(request.data)
    message['itemId'] = data['itemId']
    message['attrId'] = data['attrId']
    message['value'] = data['value']
    set_comparison_attribute_value(data['itemId'], data['attrId'], data['value'])
    return jsonify(message)


@app.route('/saveComparisonItemName', methods=["POST"])
def saveComparisonItemName():
    message = {}
    data = json.loads(request.data)
    message['itemId'] = data['itemId']
    message['value'] = data['value']
    set_item_name(data['itemId'], data['value'])
    return jsonify(message)


@app.route('/addComparisonAttr', methods=["POST"])
def addComparisonAttr():
    attrId = {}
    data = json.loads(request.data)
    attrId['attrId'] = (add_sheet_attribute_back(data['compId']))
    return jsonify(attrId)


@app.route('/addComparisonItem', methods=["POST"])
def addComparisonItem():
    itemId = {}
    data = json.loads(request.data)
    itemId['itemId'] = (add_comparison_item_back(data['compId']))
    return jsonify(itemId)


@app.route('/deleteComparisonAttr', methods=["POST"])
def deleteComparisonAttr():
    message = {}
    data = json.loads(request.data)
    delete_sheet_attribute(data['attrId'])
    message['success'] = 'success'
    return jsonify(message)


@app.route('/deleteComparisonItem', methods=["POST"])
def deleteComparisonItem():
    message = {}
    data = json.loads(request.data)
    delete_comparison_item(data['itemId'])
    message['success'] = 'success'
    return jsonify(message)


@app.route('/saveComparisonAsTemplate', methods=["POST"])
def saveComparisonAsTemplate():
    tempId = {}
    data = json.loads(request.data)
    tempId['tempId'] = (save_comparison_as_template(data['compId'], data['name']))
    return jsonify(tempId)


@app.route('/deleteComparison/<int:comp_id>')
def deleteComparison(comp_id):
    delete_sheet(comp_id)
    return redirect(url_for('dashboard'))


@app.route('/newComparison')
def newComparison():
    return render_template('newComparison.html')

# FOR TESTING PURPOSES ONLY; DELETE ONCE LINKED TO PROPERLY
@app.route('/new_empty_comparison')
def new_empty_comparison():
    from models import Account
    if not current_user.is_anonymous:
        id = create_empty_comparison(current_user.id)
        return redirect(share_comparison(id, current_user.id))
    else:
        # consider hard-coding guest_id after more database finalization
        guest_id = Account.query.filter_by(username='guest').first().id
        id = create_empty_comparison(guest_id)
        return redirect(share_comparison(id, guest_id))


@app.route('/testbed')
def testbed():
    comparison = get_comparison(12)
    return render_template('testbed.html', comparison=comparison)


@app.route('/index')
def index2():
    return render_template('index.html')


# dashboard
@app.route('/dashboard')
def dashboard():
    if current_user.is_anonymous:
        return redirect(url_for('index'))

    # TODO: consider sorting all_comp in python for recent_comp (though sorting likely faster on database side through indices, returning both recent_comp and all_comp is inefficient)
    recent_comp = get_recent_user_comparisons(current_user.id, 5, get_json=False)
    all_comp = get_user_comparisons(current_user.id, get_json=False)
    all_temp = get_user_templates(current_user.id, get_json=False)

    # TODO: consider only loading sample_temp and temp_attributes on relevant modal links
    sample_temp = get_sample_templates()
    user_temp = get_user_templates_detailed(current_user.id)
    return render_template('dashboard.html', recent_comp=recent_comp, all_comp=all_comp, all_temp=all_temp,
                           sample_temp=sample_temp, user_temp=user_temp)


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/faq')
def faq():
    return render_template('faq.html')


@app.route('/profile_form', methods=["GET", "POST"])
@login_required
def profile_form():
    session = db.session

    username = request.args.get('newUsername')
    email = request.args.get('newEmail')
    password = request.args.get('newPassword')

    error = False
    username_error = None
    email_error = None

    try:
        user = session.query(Account).filter_by(id=current_user.id).first()

        if username:
            if username == current_user.username:
                username_error = 'This is already your username'
                error = True
            elif Account.query.filter_by(username=username).count() > 0:
                username_error = 'Username already taken'
                error = True
        if email:
            if email == current_user.email:
                email_error = 'This is already your email'
                error = True
            elif Account.query.filter_by(email=email).count() > 0:
                email_error = 'Email already taken'
                error = True

        # update only if no errors in any field
        if not error:
            if username:
                current_user.username = username
                user.username = username
            if email:
                current_user.email = email
                user.email = email
            # password matching handled in frontend
            if password:
                set_password(current_user.id, password)

            session.commit()

    # may occur if another user registers/changes username/email before commit
    except sqlalchemy.exc.IntegrityError as err:
        if err.orig.pgcode == '23505':
            if err.orig.diag.constraint_name == 'account_email_key':
                email_error = 'Email already taken'
            elif err.orig.diag.constraint_name == 'account_username_key':
                username_error = 'Username already taken'
        session.rollback()

    data = {'error': error, 'username_error': username_error, 'email_error': email_error}

    return jsonify(data)


@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')


@app.route('/signup')
def signup():
    return render_template('signup.html')


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
        # Search the email column
        try:
            user = Account.query.filter_by(email=emailOrUsername).one()
        except NoResultFound:
            # User not found, inform guest user
            data['error'] = "We couldn't find an associated email address."
            return jsonify(data)

    # User is populated at this point, grab email to send email to

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
        email = ts.loads(token, salt='recover-key', max_age=86400)
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

    return render_template('reset_with_token.html', token=token, valid_link=valid_link, change_success=change_success,
                           password_valid=password_valid)


# TODO: consider adding requirements to password (length, character types, etc.)
@app.route('/add_user')
def add_user():
    data = {}
    registerEmail = request.args.get('registerEmail')
    registerUsername = request.args.get('registerUsername')
    registerPassword = request.args.get('registerPassword')

    # Make sure the username and email are available
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
        # data is empty, no duplicate username/emails
        register_user(registerEmail, registerUsername, registerPassword)
        return login_helper(registerUsername, registerPassword)


@app.route('/login')
def login():
    loginUsername = request.args.get('loginUsername')
    loginPassword = request.args.get('loginPassword')

    return login_helper(loginUsername, loginPassword)


def login_helper(loginUsername, loginPassword):
    data = {}

    if validate_login(loginUsername, loginPassword):
        # Login successful
        user = Account.query.filter_by(username=loginUsername).one()
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
    return redirect(url_for('index'))


# returns url encoding specified comparison id
@app.template_filter('share_comparison')
def share_comparison(id, user_id):
    token = ts.dumps((id, user_id), salt='comparison-data')
    return url_for('view_comparison', token=token, _external=True)


# returns url encoding specified template id
@app.template_filter('share_template')
def share_template(id, user_id):
    token = ts.dumps((id, user_id), salt='template-data')
    return url_for('view_template', token=token, _external=True)


@app.route('/comparison/<token>')
def view_comparison(token):
    comparison_id, user_id = ts.loads(token, salt='comparison-data')

    if not current_user.is_anonymous and user_id == current_user.id:
        return render_template('workspace.html', comparison=get_comparison(comparison_id), userId=current_user.id)
    else:
        # TODO guest view (consider separate view for logged in users of different account so that they can copy comparisons)
        currUserId = 0
        if not current_user.is_anonymous:
            currUserId = current_user.id

        return render_template('workspace.html', comparison=get_comparison(comparison_id), userId=currUserId)


@app.route('/template/<token>')
def view_template(token):
    template_id, user_id = ts.loads(token, salt='template-data')
    if not current_user.is_anonymous and user_id == current_user.id:
        query = text("""
        select * from user_template natural join sheet where id = :id;
        """)
        templateName = db.engine.execute(query, id=template_id).fetchone()
        return render_template('template.html', template=get_template(template_id, get_json=False), templateName=templateName)
    else:
        # TODO guest view (consider separate view for logged in users of different account so that they can copy comparisons)
        abort(404)


@app.route('/csv/<token>')
def csv(token):

    comparison_id, user_id = ts.loads(token, salt='comparison-data')

    return get_comparison_csv(comparison_id)

@app.teardown_request
def teardown_request(exception):
    if exception:
        db.session.rollback()
    db.session.remove()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

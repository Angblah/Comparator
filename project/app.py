from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('home.html')


@app.route('/newComparison')
def hello():
    return render_template('newComparison.html')


if __name__ == '__main__':
    app.run(debug=True)

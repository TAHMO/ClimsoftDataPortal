from flask import Flask, send_from_directory
from flask_security import Security, login_required, SQLAlchemySessionUserDatastore
from app.models import db
from app.models.user import User, Role
from app.controllers import general_api, graph_api, user_api
import os

app = Flask(__name__, static_folder="../dashboard", template_folder="../dashboard")
app.register_blueprint(general_api)
app.register_blueprint(graph_api)
app.register_blueprint(user_api)

app.config['SECRET_KEY'] = 'super-secret'
app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
app.config['SECURITY_PASSWORD_SALT'] = 'salt'

# Setup Flask-Security
user_datastore = SQLAlchemySessionUserDatastore(db, User, Role)
security = Security(app, user_datastore)

@app.route('/', defaults={'path': ''})
@app.route('/portal/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.template_folder, 'index.html')
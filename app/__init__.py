from flask import Flask, send_from_directory
from flask_security import Security, login_required
from app.models import db, user_datastore
from app.controllers import general_api, graph_api, user_api, export_api, map_api
import os

app = Flask(__name__, static_folder="../dashboard", template_folder="../dashboard")
app.register_blueprint(general_api)
app.register_blueprint(graph_api)
app.register_blueprint(user_api)
app.register_blueprint(export_api)
app.register_blueprint(map_api)

app.config['SECRET_KEY'] = 'super-secret'
app.config['SECURITY_REGISTERABLE'] = False
app.config['SECURITY_TRACKABLE'] = True
app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
app.config['SECURITY_PASSWORD_SALT'] = 'salt'
app.config['SQLALCHEMY_POOL_SIZE'] = 20
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 300

# Suppress Flask-Security messages.
app.config['SECURITY_FLASH_MESSAGES'] = False

security = Security(app, user_datastore)

@app.route('/', defaults={'path': ''})

@app.route('/portal/<path:path>')
@login_required
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.template_folder, 'index.html')

@app.teardown_appcontext
def shutdown_session(exception=None):
    """
    Resolve database session issues for the combination of Postgres/Sqlalchemy scoped session/Flask-admin.

    :param exception:
    """
    # load all expired attributes for the given instance
    db.expire_all()

@app.teardown_request
def session_clear(exception=None):
    """
    Resolve database session issues for the combination of Postgres/Sqlalchemy to rollback database transactions after an exception is thrown.
    """
    db.remove()
    if exception and db.is_active:
        db.rollback()
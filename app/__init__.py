from flask import Flask, send_from_directory
from app.models import *
from app.controllers import general_api, graph_api
import os

app = Flask(__name__, static_folder="../dashboard", template_folder="../dashboard")
app.register_blueprint(general_api)
app.register_blueprint(graph_api)

@app.route('/', defaults={'path': ''})
@app.route('/portal/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.template_folder, 'index.html')
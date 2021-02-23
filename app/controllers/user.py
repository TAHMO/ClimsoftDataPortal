from flask import Blueprint, jsonify, request
from flask_security import roles_accepted, utils
from app.models.user import User, AccessVariable, AccessStation
from app.models import db, user_datastore
from jsonschema import validate, ValidationError

user_api = Blueprint('user_api', __name__)

user_schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string"},
        "name": {"type": "string"},
        "role": {"type": "string"},
        "access": {
            "type": "object",
            "properties": {
                "stations": {
                    "type": "object",
                    "properties": {
                        "specific": {"type": "array"},
                        "unlimited": {"type": "boolean"}
                    }
                },
                "variables": {
                    "type": "object",
                    "properties": {
                        "specific": {"type": "array"},
                        "standard": {"type": "boolean"},
                        "unlimited": {"type": "boolean"}
                    }
                },
            }
        }
    },
    "minProperties": 4,
    "additionalProperties": False
}

@user_api.route("/users", methods=['GET'])
@roles_accepted("admin")
def user_list():
    users = db.query(User).order_by(User.username.asc()).all()

    response = {
        'users': [
            {
                '_id': user.id,
                'profile': {
                    'name': user.username
                },
                'email': user.email,
                'role': "admin" if "admin" in (role.name for role in user.roles) else "user",
                'lastLogin': user.last_login_at
            } for user in users
        ]
    }

    return jsonify(response)

@user_api.route("/users", methods=['POST'])
@roles_accepted("admin")
def create_user():
    content = request.get_json(silent=True)
    validate(instance=content, schema=user_schema)

    user = user_datastore.create_user(username=content["name"], email=content["email"],password=utils.hash_password("test"), roles=(["admin"] if content["role"] == "admin" else []), access_stations_all=(content['access']['stations']['unlimited'] == True), access_variables_all=(content['access']['variables']['unlimited'] == True), access_variables_standard=(content['access']['variables']['standard'] == True))

    # Variable and station access config.
    user.access_stations_all = (content['access']['stations']['unlimited'] == True)
    user.access_variables_all = (content['access']['variables']['unlimited'] == True)
    user.access_variables_standard = (content['access']['variables']['standard'] == True)

    if content['access']['variables']['unlimited'] == False and content['access']['variables']['standard'] == False:
        user.access_variable_specific = list(map(lambda x: AccessVariable(variable_id=int(x)), content['access']['variables']['specific']))
    else:
        user.access_variable_specific = []

    if content['access']['stations']['unlimited'] == False:
        user.access_stations_specific = list(map(lambda x: AccessStation(station_id=x), content['access']['stations']['specific']))
    else:
        user.access_stations_specific = []

    db.commit()
    return jsonify({ "status": "success" })

@user_api.route("/users/<id>", methods=['GET'])
@roles_accepted("admin")
def get_user(id):
    user = User.query.get(id)
    if not user:
        raise ValueError('Invalid user with identifier %s' % id)

    userJSON = {
        '_id': user.id,
        'profile': {
            'name': user.username
        },
        'email': user.email,
        'role': "admin" if "admin" in (role.name for role in user.roles) else "user",
        'lastLogin': user.last_login_at,
        'access': {
            'stations': {
                'unlimited': user.access_stations_all,
                'specific': list(map(lambda x: x.station_id, user.access_stations_specific))
            },
            'variables': {
                'unlimited': user.access_variables_all,
                'standard': user.access_variables_standard,
                'specific': list(map(lambda x: x.variable_id, user.access_variable_specific))
            }
        }
    }
    return jsonify({ "status": "success", "user": userJSON })

@user_api.route("/users/<id>", methods=['PUT'])
@roles_accepted("admin")
def edit_user(id):
    user = User.query.get(id)
    if not user:
        raise ValueError('Invalid user with identifier %s' % id)

    content = request.get_json(silent=True)
    validate(instance=content, schema=user_schema)

    user.email = content["email"]
    user.username = content["name"]

    if content["role"] == "admin":
        user_datastore.add_role_to_user(user.email, "admin")
    elif "admin" in (role.name for role in user.roles):
        user_datastore.remove_role_from_user(user.email, "admin")

    # Variable and station access config.
    user.access_stations_all = (content['access']['stations']['unlimited'] == True)
    user.access_variables_all = (content['access']['variables']['unlimited'] == True)
    user.access_variables_standard = (content['access']['variables']['standard'] == True)

    if content['access']['variables']['unlimited'] == False and content['access']['variables']['standard'] == False:
        user.access_variable_specific = list(map(lambda x: AccessVariable(variable_id=int(x)), content['access']['variables']['specific']))
    else:
        user.access_variable_specific = []

    if content['access']['stations']['unlimited'] == False:
        user.access_stations_specific = list(map(lambda x: AccessStation(station_id=x), content['access']['stations']['specific']))
    else:
        user.access_stations_specific = []

    db.commit()
    return jsonify({ "status": "success" })

@user_api.errorhandler(ValidationError)
@user_api.errorhandler(ValueError)
def handle(e):
    return jsonify({"status": "error", "error": "Invalid input for user", "message": str(e)}), 400
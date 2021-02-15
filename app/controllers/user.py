from flask import Blueprint, jsonify, request
from app.models.user import User
from app.models import db

user_api = Blueprint('user_api', __name__)

@user_api.route("/users", methods=['GET'])
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
                'role': "admin" if user.admin else "user",
                'lastLogin': user.last_login_at
            } for user in users
        ]
    }

    return jsonify(response)
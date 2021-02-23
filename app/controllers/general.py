from flask import Blueprint, jsonify, request
from flask_security import login_required, current_user
from app.models.station import Station
from app.models.variable import Variable
from app.models import db

general_api = Blueprint('general_api', __name__)

@general_api.route("/init", methods=['GET'])
@login_required
def station_list():
    stations = db.query(Station).order_by(Station.stationId.asc()).all()
    variables = db.query(Variable).filter(Variable.elementtype.like("%AWS%") | Variable.elementtype.like("%hourly%")).order_by(Variable.elementName.asc()).all()

    standard_variables = [
        881,    # Temp
        884,    # Pressure
        893,    # RH
        892,    # Precipitation
        895,    # Wind direction
        879     # Wind speed
    ]

    other_variables = [
        886,    # Gust speed
        894,    # Solar rad
        891,    # MSL pressure
        916,    # Vapour pressure
        915,    # Soil moisture
    ]

    response = {
        'stations': [
            {
                'code': station.stationId,
                'location': {
                    'latitude': station.latitude,
                    'longitude': station.longitude,
                    'elevationmsl': station.elevation,
                    'name': station.stationName
                }
            } for station in list(filter(lambda s: s.latitude and s.longitude, stations))
        ],
        'variables': [
            {
                'id': variable.elementId,
                'description': variable.elementName,
                'shortcode': variable.elementId,
                'units': variable.units,
                'standard': variable.elementId in standard_variables,
                'elementtype': variable.elementtype
            } for variable in list(filter(lambda v: v.elementId in standard_variables or v.elementId in other_variables, variables))
        ],
        'user': {
            '_id': current_user.id,
            'profile': {
                'name': current_user.username
            },
            'email': current_user.email,
            'role': "admin" if "admin" in (role.name for role in current_user.roles) else "user",
            'lastLogin': current_user.last_login_at,
            'access': {
                'stations': {
                    'unlimited': current_user.access_stations_all,
                    'specific': list(map(lambda x: x.station_id, current_user.access_stations_specific))
                },
                'variables': {
                    'unlimited': current_user.access_variables_all,
                    'standard': current_user.access_variables_standard,
                    'specific': list(map(lambda x: x.variable_id, current_user.access_variable_specific))
                }
            }
        },
        'stationAccess': [ station.stationId for station in stations ] if current_user.access_stations_all else list(map(lambda x: x.station_id, current_user.access_stations_specific)),
        'variableAccess': [ variable.elementId for variable in variables ] if current_user.access_variables_all else  list(map(lambda x: x.variable_id, current_user.access_variable_specific))
    }

    return jsonify(response)
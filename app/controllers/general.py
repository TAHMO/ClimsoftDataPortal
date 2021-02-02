from flask import Blueprint, jsonify, request
from app.models.station import Station
from app.models.variable import Variable
from app.models import db

general_api = Blueprint('general_api', __name__)

@general_api.route("/init", methods=['GET'])
def station_list():
    stations = db.query(Station).order_by(Station.stationId.asc()).all()
    variables = db.query(Variable).filter(Variable.elementtype.like("%AWS%") | Variable.elementtype.like("%hourly%")).order_by(Variable.elementName.asc()).all()

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
                'shortcode': variable.abbreviation,
                'units': variable.units,
                'standard': True,
                'elementtype': variable.elementtype
            } for variable in variables
        ],
        'user': {
            'access': {
                'stations': {
                    'unlimited': True,
                    'specific': []
                },
                'variables': {
                    'unlimited': True,
                    'standard': True,
                    'specific': []
                },
                'period': {
                    'unlimited': True,
                    'startDate': '2021-01-01T00:00:00.000Z',
                    'endDate': '2021-01-01T00:00:00.000Z'
                }
            },
            'demo': False,
            'role': 'admin',
            'groupRole': 'user'
        },
        'stationAccess': [ station.stationId for station in stations ],
        'variableAccess': [ variable.abbreviation for variable in variables ]
    }

    return jsonify(response)
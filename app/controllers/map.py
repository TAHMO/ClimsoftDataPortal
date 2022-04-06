from flask import Blueprint, jsonify, request
from flask_security import login_required
from app.models import db
from app.models.observation import Observation
from app.models.observationinitial import ObservationInitial
from datetime import datetime, timedelta
from sqlalchemy import func

map_api = Blueprint('map_api', __name__)

@map_api.route("/map", methods=['POST'])
@login_required
def map():
    content = request.get_json(silent=True)
    response = {}
    response['type'] = content['type']
    response['valueActive'] = False
    response['detailsActive'] = False
    response['details'] = {}
    response['values'] = {}
    response['colors'] = {}

    if content['type'] == "availability":
        response['detailsActive'] = True

        observations = Observation.query.with_entities(Observation.recordedFrom, func.min(Observation.obsDatetime).label('min'), func.max(Observation.obsDatetime).label('max')).group_by(Observation.recordedFrom).all()
        for stationInfo in list(observations):
            response['details'][stationInfo.recordedFrom] = {
                'min': stationInfo.min.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'max': stationInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'qc': True
            }
            response['colors'][stationInfo.recordedFrom] = "green"

        observationsInitial = ObservationInitial.query.with_entities(ObservationInitial.recordedFrom, func.min(ObservationInitial.obsDatetime).label('min'), func.max(ObservationInitial.obsDatetime).label('max')).group_by(ObservationInitial.recordedFrom).all()
        for obsInitialInfo in list(observationsInitial):
            if obsInitialInfo.recordedFrom not in response['details'].keys():
                response['details'][obsInitialInfo.recordedFrom] = {
                    'min': obsInitialInfo.min.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'max': obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'qc': False
                }
                response['colors'][obsInitialInfo.recordedFrom] = "orange"
            elif obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ') > response['details'][obsInitialInfo.recordedFrom]['max']:
                response['details'][obsInitialInfo.recordedFrom]['max'] = obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ')
                response['details'][obsInitialInfo.recordedFrom]['qc'] = False
                response['colors'][obsInitialInfo.recordedFrom] = "orange"

    elif content['type'] == "pressuretrend":
        endDate = datetime.now()
        startDate = endDate - timedelta(hours=24)
    elif content['type'] == "30dayprecipitation":
        endDate = datetime.now()
        startDate = endDate - timedelta(days=30)

    elif content['type'] == "7daytempmin":
        endDate = datetime.now()
        startDate = endDate - timedelta(days=7)
    elif content['type'] == "7daytempmax":
        endDate = datetime.now()
        startDate = endDate - timedelta(days=7)
    else:
        response['error'] = 'Invalid type'

    return jsonify(response)
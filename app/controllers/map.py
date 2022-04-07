from flask import Blueprint, jsonify, request
from flask_security import login_required
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

            timeDiff = datetime.now() - stationInfo.max
            color = "#008000"
            if timeDiff > timedelta(days=7):
                color = "#FF0000"
            elif timeDiff > timedelta(hours=24):
                color = "#FFA500"
            response['colors'][stationInfo.recordedFrom] = color

        observationsInitial = ObservationInitial.query.with_entities(ObservationInitial.recordedFrom, func.min(ObservationInitial.obsDatetime).label('min'), func.max(ObservationInitial.obsDatetime).label('max')).group_by(ObservationInitial.recordedFrom).all()
        for obsInitialInfo in list(observationsInitial):
            if obsInitialInfo.recordedFrom not in response['details'].keys():
                response['details'][obsInitialInfo.recordedFrom] = {
                    'min': obsInitialInfo.min.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'max': obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'qc': False
                }
                response['colors'][obsInitialInfo.recordedFrom] = "#FF0000"
            elif obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ') > response['details'][obsInitialInfo.recordedFrom]['max']:
                response['details'][obsInitialInfo.recordedFrom]['max'] = obsInitialInfo.max.strftime('%Y-%m-%dT%H:%M:%SZ')
                response['details'][obsInitialInfo.recordedFrom]['qc'] = False
                response['colors'][obsInitialInfo.recordedFrom] = "#FF0000"

    elif content['type'] == "pressuretrend":
        response['valueActive'] = True
        endDate = datetime.now()
        startDate = endDate - timedelta(hours=124)
        observationStations = Observation.query.with_entities(Observation.recordedFrom, Observation.obsDatetime, Observation.obsValue)\
            .filter(Observation.obsDatetime >= startDate).filter((Observation.describedBy == 884) | (Observation.describedBy == 890) | (Observation.describedBy == 891))\
            .group_by(Observation.recordedFrom).all()
        for observationStation in list(observationStations):
            observationStart = Observation.query.with_entities(Observation.recordedFrom, Observation.obsDatetime, Observation.obsValue)\
                .filter(Observation.obsDatetime >= startDate).filter((Observation.describedBy == 884) | (Observation.describedBy == 890) | (Observation.describedBy == 891))\
                .filter(Observation.recordedFrom == observationStation.recordedFrom).first()

            observationEnd = Observation.query.with_entities(Observation.recordedFrom, Observation.obsDatetime,Observation.obsValue)\
                .filter(Observation.obsDatetime >= startDate).filter((Observation.describedBy == 884) | (Observation.describedBy == 890) | (Observation.describedBy == 891))\
                .filter(Observation.recordedFrom == observationStation.recordedFrom).order_by(Observation.obsDatetime.desc()).first()

            response['values'][observationStation.recordedFrom] = observationEnd.obsValue - observationStart.obsValue
    elif content['type'] == "30dayprecipitation":
        response['valueActive'] = True
        endDate = datetime.now()
        startDate = endDate - timedelta(days=30)
        observations = Observation.query.with_entities(Observation.recordedFrom, func.sum(Observation.obsValue).label('total'), func.min(Observation.obsDatetime).label('first'), func.max(Observation.obsDatetime).label('last'))\
            .filter((Observation.describedBy == 892) | (Observation.describedBy == 5)).filter(Observation.obsDatetime >= startDate).group_by(Observation.recordedFrom).all()
        for observation in list(observations):
            response['values'][observation.recordedFrom] = observation.total
    elif content['type'] == "7daytempmin":
        response['valueActive'] = True
        endDate = datetime.now()
        startDate = endDate - timedelta(days=7)
        observations = Observation.query.with_entities(Observation.recordedFrom, func.min(Observation.obsValue).label('value'))\
            .filter((Observation.describedBy == 881) | (Observation.describedBy == 3)).filter(Observation.obsDatetime >= startDate).group_by(Observation.recordedFrom).all()
        for observation in list(observations):
            response['values'][observation.recordedFrom] = observation.value
    elif content['type'] == "7daytempmax":
        response['valueActive'] = True
        endDate = datetime.now()
        startDate = endDate - timedelta(days=7)
        observations = Observation.query.with_entities(Observation.recordedFrom, func.max(Observation.obsValue).label('value'))\
            .filter((Observation.describedBy == 881) | (Observation.describedBy == 2)).filter(Observation.obsDatetime >= startDate).group_by(Observation.recordedFrom).all()
        for observation in list(observations):
            response['values'][observation.recordedFrom] = observation.value
    elif content['type']:
        response['error'] = 'Invalid type'

    return jsonify(response)
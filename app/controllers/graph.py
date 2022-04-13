from flask import Blueprint, jsonify, request
from flask_security import login_required
from app.models import db
from app.models.observation import Observation
from datetime import datetime, timedelta
import pytz

graph_api = Blueprint('graph_api', __name__)

@graph_api.route("/graph", methods=['POST'])
@login_required
def graph():
    content = request.get_json(silent=True)

    if content['period'] == "month":
        endDate = datetime.now()
        startDate = endDate - timedelta(days=30)
    elif content['period'] == "custom":
        startDate = datetime.strptime(content['startDate'], "%Y-%m-%dT%H:%M:%S.%fZ")
        endDate = datetime.strptime(content['endDate'], "%Y-%m-%dT%H:%M:%S.%fZ")
    else:
        endDate = datetime.now()
        startDate = endDate - timedelta(days=7)

    response = []
    if content['stations']:
        for station in content['stations']:
            observations = Observation.query.filter(Observation.recordedFrom == station).filter(Observation.obsDatetime >= startDate).filter(Observation.obsDatetime <= endDate).filter(
                Observation.describedBy == content['variable']).filter(Observation.obsValue != -999).order_by(Observation.obsDatetime.asc()).all()

            tz_adjust = pytz.timezone(content['timezone']).utcoffset(startDate).total_seconds() if content['timezone'] != "UTC" and len(observations) else 0

            response.append(
                {
                    "station": station,
                    "timestamps": [ (observation.obsDatetime + timedelta(0,tz_adjust)).strftime('%Y-%m-%dT%H:%M:%SZ') for observation in observations ],
                    "values": [ observation.obsValue for observation in observations ]
                }
            )
    return jsonify(response)
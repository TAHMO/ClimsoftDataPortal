from flask import Blueprint, jsonify, request, send_file
from flask_security import login_required, current_user
from app.models import db
from app.models.observation import Observation
from app.models.station import Station
from app.models.variable import Variable
from app.models.export import Export, ExportVariable, ExportStation
from jsonschema import validate, ValidationError
from datetime import datetime, timedelta
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO
import pandas as pd

export_api = Blueprint('export_api', __name__)

export_schema = {
    "type": "object",
    "properties": {
        "description": {"type": "string"},
        "startDate": {"type": "string"},
        "endDate": {"type": "string"},
        "timezone": {"type": "string"},
        "stations": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "variables": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "minProperties": 6,
    "additionalProperties": False
}

@export_api.route("/export", methods=['POST'])
@login_required
def create():
    content = request.get_json(silent=True)
    validate(instance=content, schema=export_schema)

    startDate = datetime.strptime(content['startDate'], "%Y-%m-%dT%H:%M:%S.%fZ")
    endDate = datetime.strptime(content['endDate'], "%Y-%m-%dT%H:%M:%S.%fZ")

    export = Export(
        user_id=current_user.id,
        aggregation="1H",
        startDate=startDate,
        endDate=endDate,
        description=content['description'],
        timezone=content['timezone'],
        variables=[ExportVariable(variable_id=int(x)) for x in content['variables']],
        stations=[ExportStation(station_id=x) for x in content['stations']]
    )

    db.add(export)
    db.commit()
    return jsonify({ "status": "success" })

@export_api.route("/export", methods=['GET'])
@login_required
def list():
    exports = db.query(Export).filter(Export.user_id == current_user.id).order_by(
        Export.created_at.desc()).all()

    return jsonify(
        {
            "status":"success",
            "exports": [
                {
                    "_id": export.id,
                    "aggregation": export.aggregation,
                    "createdAt": export.created_at,
                    "description": export.description,
                    "startDate": export.startDate,
                    "endDate": export.endDate,
                    "stations": [ s.station_id for s in export.stations ],
                    "variables": [ v.variable_id for v in export.variables ],
                    "status": "completed",
                    "user": export.user_id
                } for export in exports
            ]
         })

@export_api.route("/download/export/<id>", methods=['GET'])
@login_required
def download(id):
    # TODO: filter for current user id.
    export = Export.query.get(id)
    if not export:
        raise ValueError('Invalid export with identifier %s' % id)

    stations = Station.query.filter(Station.stationId.in_([ s.station_id for s in export.stations])).all()
    variables = Variable.query.filter(Variable.elementId.in_([ v.variable_id for v in export.variables])).all()
    timestamp_column = 'Timestamp {}'.format(export.timezone)

    # Start ZIP archive in memory.
    in_memory = BytesIO()
    zf = ZipFile(in_memory, mode="w", compression=ZIP_DEFLATED)

    for station in stations:
        dataframes = []
        for variable in variables:
            observations = Observation.query.with_entities(Observation.obsDatetime, Observation.obsValue).filter(Observation.recordedFrom == station.stationId)\
                .filter(Observation.obsDatetime >= export.startDate).filter(Observation.obsDatetime <= export.endDate)\
                .filter(Observation.describedBy == variable.elementId).order_by(Observation.obsDatetime.asc()).all()

            if len(observations):
                df = pd.DataFrame.from_records(observations, index=timestamp_column, columns=[timestamp_column,'{} ({})'.format(variable.abbreviation, variable.units)])
                if export.timezone != 'UTC':
                    df = df.tz_localize('UTC').tz_convert('Africa/Nairobi')
                dataframes.append(df)

        if len(dataframes):
            zf.writestr('{}_{}.csv'.format(station.stationId, "".join(c for c in station.stationName if c.isalnum()).rstrip()),
                        pd.concat(dataframes, axis=1, join="inner").to_csv(na_rep='', date_format='%Y-%m-%d %H:%M'))

    # Add metadata file to zip archive.
    zf.writestr('metadata.csv', getMetadataCSV(stations))

    # Close the zip file and retrieve it's contents from memory.
    zf.close()
    in_memory.seek(0)

    return send_file(in_memory, attachment_filename="Export_{}.zip".format(export.id), as_attachment=True)

@export_api.errorhandler(ValidationError)
@export_api.errorhandler(ValueError)
def handle(e):
    return jsonify({"status": "error", "error": "Invalid input for export", "message": str(e)}), 400

def getMetadataCSV(stations):
    stationsMetadata = []
    for station in stations:
        stationsMetadata.append([
            station.stationId,
            station.stationName,
            station.latitude,
            station.longitude,
            station.elevation
        ])

    if len(stationsMetadata) > 0:
        metaDf = pd.DataFrame.from_records(stationsMetadata,
                                           columns=["station id", "name", "latitude", "longitude", "elevation (m)"])
        return metaDf.to_csv(na_rep='', index=False)
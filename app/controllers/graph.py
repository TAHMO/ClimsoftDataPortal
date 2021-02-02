from flask import Blueprint, jsonify, request
from app.models import db
from sqlalchemy import MetaData

meta = MetaData(engine).reflect()
table = meta.tables['user']

graph_api = Blueprint('graph_api', __name__)

@graph_api.route("/graph", methods=['POST'])
def graph():


    response = [{"station":"TA00001","timestamps":["2021-01-25T16:00:00.000Z","2021-01-25T17:00:00.000Z","2021-01-25T18:00:00.000Z","2021-01-25T19:00:00.000Z","2021-01-25T20:00:00.000Z","2021-01-25T21:00:00.000Z","2021-01-25T22:00:00.000Z","2021-01-25T23:00:00.000Z","2021-01-26T00:00:00.000Z","2021-01-26T01:00:00.000Z","2021-01-26T02:00:00.000Z","2021-01-26T03:00:00.000Z","2021-01-26T04:00:00.000Z","2021-01-26T05:00:00.000Z","2021-01-26T06:00:00.000Z","2021-01-26T07:00:00.000Z","2021-01-26T08:00:00.000Z","2021-01-26T09:00:00.000Z","2021-01-26T10:00:00.000Z","2021-01-26T11:00:00.000Z","2021-01-26T12:00:00.000Z","2021-01-26T13:00:00.000Z","2021-01-26T14:00:00.000Z","2021-01-26T15:00:00.000Z","2021-01-26T16:00:00.000Z","2021-01-26T17:00:00.000Z","2021-01-26T18:00:00.000Z","2021-01-26T19:00:00.000Z","2021-01-26T20:00:00.000Z","2021-01-26T21:00:00.000Z","2021-01-26T22:00:00.000Z","2021-01-26T23:00:00.000Z","2021-01-27T00:00:00.000Z","2021-01-27T01:00:00.000Z","2021-01-27T02:00:00.000Z","2021-01-27T03:00:00.000Z","2021-01-27T04:00:00.000Z","2021-01-27T05:00:00.000Z","2021-01-27T06:00:00.000Z","2021-01-27T07:00:00.000Z","2021-01-27T08:00:00.000Z","2021-01-27T09:00:00.000Z","2021-01-27T10:00:00.000Z","2021-01-27T11:00:00.000Z","2021-01-27T12:00:00.000Z","2021-01-27T13:00:00.000Z","2021-01-27T14:00:00.000Z","2021-01-27T15:00:00.000Z","2021-01-27T16:00:00.000Z","2021-01-27T17:00:00.000Z","2021-01-27T18:00:00.000Z","2021-01-27T19:00:00.000Z","2021-01-27T20:00:00.000Z","2021-01-27T21:00:00.000Z","2021-01-27T22:00:00.000Z","2021-01-27T23:00:00.000Z","2021-01-28T00:00:00.000Z","2021-01-28T01:00:00.000Z","2021-01-28T02:00:00.000Z","2021-01-28T03:00:00.000Z","2021-01-28T04:00:00.000Z","2021-01-28T05:00:00.000Z","2021-01-28T06:00:00.000Z","2021-01-28T07:00:00.000Z","2021-01-28T08:00:00.000Z","2021-01-28T09:00:00.000Z","2021-01-28T10:00:00.000Z","2021-01-28T11:00:00.000Z","2021-01-28T12:00:00.000Z","2021-01-28T13:00:00.000Z","2021-01-28T14:00:00.000Z","2021-01-28T15:00:00.000Z","2021-01-28T16:00:00.000Z","2021-01-28T17:00:00.000Z","2021-01-28T18:00:00.000Z","2021-01-28T19:00:00.000Z","2021-01-28T20:00:00.000Z","2021-01-28T21:00:00.000Z","2021-01-28T22:00:00.000Z","2021-01-28T23:00:00.000Z","2021-01-29T00:00:00.000Z","2021-01-29T01:00:00.000Z","2021-01-29T02:00:00.000Z","2021-01-29T03:00:00.000Z","2021-01-29T04:00:00.000Z","2021-01-29T05:00:00.000Z","2021-01-29T06:00:00.000Z","2021-01-29T07:00:00.000Z","2021-01-29T08:00:00.000Z","2021-01-29T09:00:00.000Z","2021-01-29T10:00:00.000Z","2021-01-29T11:00:00.000Z","2021-01-29T12:00:00.000Z","2021-01-29T13:00:00.000Z","2021-01-29T14:00:00.000Z","2021-01-29T15:00:00.000Z","2021-01-29T16:00:00.000Z","2021-01-29T17:00:00.000Z","2021-01-29T18:00:00.000Z","2021-01-29T19:00:00.000Z","2021-01-29T20:00:00.000Z","2021-01-29T21:00:00.000Z","2021-01-29T22:00:00.000Z","2021-01-29T23:00:00.000Z","2021-01-30T00:00:00.000Z","2021-01-30T01:00:00.000Z","2021-01-30T02:00:00.000Z","2021-01-30T03:00:00.000Z","2021-01-30T04:00:00.000Z","2021-01-30T05:00:00.000Z","2021-01-30T06:00:00.000Z","2021-01-30T07:00:00.000Z","2021-01-30T08:00:00.000Z","2021-01-30T09:00:00.000Z","2021-01-30T10:00:00.000Z","2021-01-30T11:00:00.000Z","2021-01-30T12:00:00.000Z","2021-01-30T13:00:00.000Z","2021-01-30T14:00:00.000Z","2021-01-30T15:00:00.000Z","2021-01-30T16:00:00.000Z","2021-01-30T17:00:00.000Z","2021-01-30T18:00:00.000Z","2021-01-30T19:00:00.000Z","2021-01-30T20:00:00.000Z","2021-01-30T21:00:00.000Z","2021-01-30T22:00:00.000Z","2021-01-30T23:00:00.000Z","2021-01-31T00:00:00.000Z","2021-01-31T01:00:00.000Z","2021-01-31T02:00:00.000Z","2021-01-31T03:00:00.000Z","2021-01-31T04:00:00.000Z","2021-01-31T05:00:00.000Z","2021-01-31T06:00:00.000Z","2021-01-31T07:00:00.000Z","2021-01-31T08:00:00.000Z","2021-01-31T09:00:00.000Z","2021-01-31T10:00:00.000Z","2021-01-31T11:00:00.000Z","2021-01-31T12:00:00.000Z","2021-01-31T13:00:00.000Z","2021-01-31T14:00:00.000Z","2021-01-31T15:00:00.000Z","2021-01-31T16:00:00.000Z","2021-01-31T17:00:00.000Z","2021-01-31T18:00:00.000Z","2021-01-31T19:00:00.000Z","2021-01-31T20:00:00.000Z","2021-01-31T21:00:00.000Z","2021-01-31T22:00:00.000Z","2021-01-31T23:00:00.000Z","2021-02-01T00:00:00.000Z","2021-02-01T01:00:00.000Z","2021-02-01T02:00:00.000Z","2021-02-01T03:00:00.000Z","2021-02-01T04:00:00.000Z","2021-02-01T05:00:00.000Z","2021-02-01T06:00:00.000Z","2021-02-01T07:00:00.000Z","2021-02-01T08:00:00.000Z","2021-02-01T09:00:00.000Z","2021-02-01T10:00:00.000Z","2021-02-01T11:00:00.000Z","2021-02-01T12:00:00.000Z","2021-02-01T13:00:00.000Z","2021-02-01T14:00:00.000Z"],"values":[86.0272727272727,86.11833333333334,86.20833333333336,86.23666666666666,86.29416666666664,86.26083333333334,86.23750000000001,86.16333333333331,86.16749999999998,86.17583333333336,86.22250000000001,86.25333333333333,86.27916666666664,86.34583333333335,86.36833333333334,86.36333333333334,86.31083333333332,86.22416666666669,86.13416666666666,86.04,85.95333333333333,85.87833333333333,85.875,85.91166666666668,85.98333333333333,86.05916666666666,86.15916666666668,86.19083333333334,86.18583333333333,86.16333333333334,86.1225,86.09833333333334,86.08583333333335,86.10416666666667,86.12166666666667,86.11500000000001,86.14750000000002,86.2425,86.26416666666665,86.23833333333334,86.17083333333333,86.11166666666668,86.02583333333332,85.92583333333333,85.84916666666669,85.80083333333333,85.8058333333333,85.83416666666666,85.90499999999997,85.95916666666669,86.05749999999999,86.09000000000002,86.09000000000002,86.07166666666666,86.02666666666666,86.01583333333333,86.00833333333333,86.01333333333332,86.06583333333332,86.1175,86.13749999999999,86.20583333333333,86.24666666666667,86.25333333333333,86.18666666666667,86.125,86.06083333333332,86,85.90333333333332,85.8675,85.90166666666666,85.91833333333335,85.95083333333334,86.01999999999998,86.125,86.18583333333335,86.21750000000002,86.18666666666665,86.15666666666665,86.12583333333333,86.11000000000001,86.10416666666667,86.14999999999998,86.2,86.21583333333335,86.29083333333331,86.31499999999996,86.3,86.26166666666666,86.18916666666668,86.10083333333334,86.01583333333333,85.93583333333333,85.8725,85.89333333333332,85.94833333333334,85.9825,86.06833333333334,86.17750000000001,86.25916666666666,86.31833333333333,86.21750000000003,86.1425,86.12916666666666,86.14166666666667,86.13833333333332,86.15166666666666,86.16083333333331,86.17750000000001,86.2525,86.29916666666664,86.2958333333333,86.2575,86.17416666666664,86.06999999999998,85.9666666666667,85.88666666666666,85.84333333333335,85.83166666666666,85.90166666666666,85.96083333333335,85.98500000000001,86.06,86.13999999999999,86.1225,86.07833333333332,86.03416666666668,85.98583333333335,85.9975,86.0533333333333,86.07166666666664,86.09083333333335,86.10666666666667,86.14166666666665,86.1425,86.13833333333332,86.10166666666667,86.0475,85.97750000000002,85.89583333333333,85.81333333333332,85.7425,85.72083333333335,85.77083333333331,85.83666666666666,85.93083333333334,86.00333333333333,86.08416666666666,86.11333333333334,86.09083333333332,86.05333333333333,86.03916666666665,86.02999999999999,86.05916666666663,86.11000000000001,86.15249999999999,86.21583333333332,86.28083333333332,86.30499999999996,86.29333333333331,86.28249999999998,86.24666666666667,86.15583333333332,86.06999999999998,85.995,85.9416666666667,85.93]}];
    return jsonify(response)
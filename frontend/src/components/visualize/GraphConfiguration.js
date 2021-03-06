import React from "react";
import _ from "lodash";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText, FormSelect, FormCheckbox, FormInput
} from "shards-react";

import { Store, Dispatcher, Constants } from "../../flux";
import PageTitle from "../common/PageTitle";
import RangeDatePicker from "../common/RangeDatePicker";
import axios from "axios";
import Plot from 'react-plotly.js';

export default class GraphConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.dateRangeReference = React.createRef();

    this.handleStationChange = this.handleStationChange.bind(this);
    this.change = this.change.bind(this);
    this.changeVariable = this.changeVariable.bind(this);
    this.submit = this.submit.bind(this);
    this.hideGraph = this.hideGraph.bind(this);

    this.updateStations = this.updateStations.bind(this);
    this.updateVariables = this.updateVariables.bind(this);
    this.updateAccess = this.updateAccess.bind(this);

    const graphTypeLabels = {
      'hourly-line': 'Line graph (1 hour values)',
      'daily-line': 'Line graph (daily values)',
      'hourly-bar': 'Bar graph (hourly values)',
      'daily-bar': 'Bar graph (daily values)',
      'windrose': 'Wind rose'
    };

    const availableGraphTypesByVariable = {
      'default': ['hourly-line']
    };

    this.state = {
      startDate: '',
      endDate: '',
      aggregation: null,
      variable: "ap",
      period: "week",
      type: "line",
      variableList: [],
      hideVariables: ["wd", "wg"],
      stations: {},
      stationList: [],
      filterString: '',
      aggregations: Store.getAggregations(),
      aggregationAccess: [],
      graphTypeLabels: graphTypeLabels,
      availableGraphTypesByVariable: availableGraphTypesByVariable,
      minDate: new Date('1970-01-01'),
      maxDate: new Date(),
      showGraph: false,
      graphData: [],
      graphTitle: '',
      graphUnits: '',
      graphType: 'scatter'
    };
  }

  change(key, value) {
    const newState = {};
    newState[key] = value;
    this.setState(newState);
  }

  changeVariable(value) {
    const newState = {};
    newState['variable'] = value;
    // Set default graph type for this variable.
    newState['type'] = (this.state.availableGraphTypesByVariable[value]) ? this.state.availableGraphTypesByVariable[value][0] : this.state.availableGraphTypesByVariable['default'][0];
    this.setState(newState);
  }

  handleStationChange(e, stationCode) {
    const newState = { 'stations': this.state.stations };
    newState['stations'][stationCode] = !this.state['stations'][stationCode];
    this.setState(newState);
  }

  submit() {
    let errors = [];
    const dateRangeReference = this.dateRangeReference.current;

    const aggregationByType = {
      'hourly-bar': '1h',
      'daily-bar': '1d',
      'hourly-line': '1h',
      'daily-line': '1d'
    };

    let graphConfig = {
      'variable': this.state.variable,
      'type': this.state.type,
      'stations': [],
      'period': this.state.period,
      'startDate': null,
      'endDate': null,
      'aggregation': aggregationByType[this.state.type]
    };

    // Validation.
    // Check date range.
    if (graphConfig.period === 'custom' && (!dateRangeReference.state.startDate || !dateRangeReference.state.startDate instanceof Date)) {
      errors.push('Invalid start date');
    }
    if (graphConfig.period === 'custom' && (!dateRangeReference.state.endDate || !dateRangeReference.state.endDate instanceof Date)) {
      errors.push('Invalid end date');
    }

    for (const station of Object.keys(this.state.stations)) {
      if (this.state.stations[station]) {
        graphConfig.stations.push(station);
      }
    }

    if (graphConfig.stations.length == 0) {
      errors.push('There are no stations selected.');
    }

    if (errors.length > 0) {
      alert('Graph plotting failed:\n' + errors.join('\n'));
      return false;
    } else {
      if (graphConfig.period === 'custom') {
        graphConfig.startDate = dateRangeReference.state.startDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.startDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.startDate.getDate()).slice(-2) + 'T00:00:00.000Z';
        graphConfig.endDate = dateRangeReference.state.endDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.endDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.endDate.getDate()).slice(-2) + 'T23:59:59.000Z';
      }
      this.showGraph();
      axios(
        {
          url: "/graph",
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: graphConfig
        }
      )
        .then(response => response.data)
        .then(response => {
          if (Array.isArray(response)) {
            const graphTitle = this.state.variableList.find(v => v.shortcode == this.state.variable)['description'];
            const graphUnits = this.state.variableList.find(v => v.shortcode == this.state.variable)['units'];
            let graphType = 'scatter';
            if (this.state.type === 'windrose') {

            } else if (this.state.type.slice(-3) === 'bar') {
              graphType = 'bar';
            }

            const graphData = response.map((serie) => { return {
              x: serie.timestamps,
              y: serie.values,
              type: graphType,
              mode: 'lines',
              name: serie.station
            }});
            this.setState({'graphData': graphData, 'graphType': graphType, 'graphTitle': graphTitle, 'graphUnits': graphUnits });
          } else {
            this.hideGraph();
            alert('Creating graph failed:\n' + response.error);
          }
        })
        .catch(function(err) {
          alert('Creating graph failed.');
        });
    }
  }

  showGraph() {
    this.setState({ 'showGraph': true });
  }

  hideGraph() {
    this.setState({ 'showGraph': false, 'graphData': [] });
  }

  updateStations() {
    const accessStationCodes = Store.getAccessStationCodes();
    const stationList = Store.getStations().filter(function(station){ return accessStationCodes.indexOf(station.code) !== -1; });
    this.setState({ 'stationList': stationList });
  }

  updateVariables() {
    const accessVariableCodes = Store.getAccessVariableCodes();
    const variableList = Store.getVariables().filter(function(variable){ return accessVariableCodes.indexOf(variable.shortcode) !== -1; });
    this.setState({ 'variableList': variableList });
    if (variableList.length && variableList[0].shortcode) {
      this.changeVariable(variableList[0].shortcode);
    }
  }

  updateAccess() {
    const user = Store.getUser();
    if(_.has(user, 'access.period.unlimited') && user.access.period.unlimited !== true) {
      this.setState({ 'minDate': new Date(user.access.period.startDate), 'maxDate': (new Date() > new Date(user.access.period.endDate)) ? new Date(user.access.period.endDate) : new Date() });
      if (this.dateRangeReference.current) {
        this.dateRangeReference.current.changeLimit(this.state.minDate, this.state.maxDate);
      }
    }
  }

  componentWillMount() {
    Store.on(Constants.EVENT_STATIONS_READY, this.updateStations);
    Store.on(Constants.EVENT_VARIABLES_READY, this.updateVariables);
    Store.on(Constants.EVENT_USER_READY, this.updateAccess);
  }

  componentWillUnmount() {
    Store.removeListener(Constants.EVENT_STATIONS_READY, this.updateStations);
    Store.removeListener(Constants.EVENT_VARIABLES_READY, this.updateVariables);
    Store.removeListener(Constants.EVENT_USER_READY, this.updateAccess);
  }

  componentDidMount() {
    Dispatcher.dispatch({
      actionType: Constants.CHECK_INIT
    });
  }

  render() {
    return (
      <div id="graph">
        {this.state.showGraph === false &&
        <div>
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title="Configure graph" subtitle="" className="text-sm-left"/>
          </Row>
          <div>
            <Row>
              <Col>
                <Card small className="mb-4">
                  <CardHeader className="border-bottom">
                    <h6 className="m-0">Graph settings</h6>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <Row className="border-bottom">
                      <Col sm="3" className="d-flex mb-2 mt-3">
                        Variable
                      </Col>
                      <Col sm="3" className="d-flex mb-2 mt-2">
                        <InputGroup>
                          <InputGroupAddon type="prepend">
                            <InputGroupText>Variable</InputGroupText>
                          </InputGroupAddon>
                          <FormSelect onChange={e => this.changeVariable(e.target.value)}>
                            {this.state.variableList.filter((variable) => this.state.hideVariables.indexOf(variable.shortcode) === -1).map((variable) => {
                              return (
                                <option value={variable.shortcode}>{variable.description}</option>
                              )
                            })}
                          </FormSelect>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row className="border-bottom">
                      <Col sm="3" className="d-flex mb-2 mt-3">
                        Graph
                      </Col>
                      <Col sm="3" className="d-flex mb-2 mt-2">
                        <InputGroup>
                          <InputGroupAddon type="prepend">
                            <InputGroupText>Type</InputGroupText>
                          </InputGroupAddon>
                          <FormSelect onChange={e => this.change("type", e.target.value)}>
                            {((this.state.availableGraphTypesByVariable[this.state.variable]) ? this.state.availableGraphTypesByVariable[this.state.variable] : this.state.availableGraphTypesByVariable['default']).map((graphCode) => {
                              return (
                                <option value={graphCode}>{this.state.graphTypeLabels[graphCode]}</option>
                              )
                            })}
                          </FormSelect>
                        </InputGroup>
                      </Col>
                    </Row>
                    <Row className={`${this.state.period === "custom" ? "border-bottom" : ""}`}>
                      <Col sm="3" className="d-flex mb-2 mt-3">
                        Period
                      </Col>
                      <Col sm="3" className="d-flex mb-2 mt-2">
                        <InputGroup>
                          <InputGroupAddon type="prepend">
                            <InputGroupText>Period</InputGroupText>
                          </InputGroupAddon>
                          <FormSelect onChange={e => this.change("period", e.target.value)}>
                            <option value="week">Last week</option>
                            <option value="month">Last month</option>
                            <option value="custom">Custom period</option>
                          </FormSelect>
                        </InputGroup>
                      </Col>
                    </Row>
                    {this.state.period === "custom" &&
                    <Row>
                      <Col sm="3" className="d-flex mb-3 mt-3">
                        Specify period
                      </Col>
                      <Col sm="3" className="d-flex mb-2 mt-2">
                        <RangeDatePicker ref={this.dateRangeReference} minDate={this.state.minDate}
                                         maxDate={this.state.maxDate}/>
                      </Col>
                    </Row>
                    }
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card small className="mb-2 scroll-500">
                  <CardHeader className="border-bottom">
                    <h6 className="m-0">Stations</h6>
                  </CardHeader>
                  <CardBody className="p-0 pb-3">
                    <Row className="border-bottom">
                      <Col sm="3" className="d-flex mb-2 mt-3 ml-3">
                        <InputGroup className="mb-3">
                          <InputGroupAddon type="prepend">
                            <InputGroupText>Filter</InputGroupText>
                          </InputGroupAddon>
                          <FormInput onChange={e => this.change("filterString", e.target.value.toLowerCase())}
                                     placeholder="e.g. station id or station name"/>
                        </InputGroup>
                      </Col>
                    </Row>
                    <table className="table mb-0">
                      <thead className="bg-light">
                      <tr>
                        <th scope="col" className="border-0"></th>
                        <th scope="col" className="border-0">
                          Station id
                        </th>
                        <th scope="col" className="border-0">
                          Location name
                        </th>
                        <th scope="col" className="border-0">
                          Latitude
                        </th>
                        <th scope="col" className="border-0">
                          Longitude
                        </th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.stationList.filter(e => ((e.location.name.toLowerCase().includes(this.state.filterString) || e.code.toLowerCase().includes(this.state.filterString)))).map((station) => {
                        return (
                          <tr>
                            <td><FormCheckbox className="mb-0" checked={this.state.stations[station.code]}
                                              onChange={e => this.handleStationChange(e, station.code)}/></td>
                            <td>{station.code}</td>
                            <td>{station.location.name}</td>
                            <td>{station.location.latitude}</td>
                            <td>{station.location.longitude}</td>
                          </tr>
                        )
                      })}
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
                <Button theme="primary" onClick={this.submit} className="mb-4 mr-1">
                  Create graph
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        }
        {this.state.showGraph === true &&
        <div>
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title={`Graph`} subtitle="" className="text-sm-left"/>
          </Row>
          <Row>
            <Col>
              { this.state.graphData.length > 0 &&
              <Plot
                data={this.state.graphData}
                layout={
                  {
                    title: this.state.graphTitle,
                    showlegend: true,
                    yaxis: {title: {text: this.state.graphUnits}},
                    barmode: (this.state.graphType === 'bar') ? 'group' : undefined
                  }
                }
                config={
                  {
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
                    displaylogo: false
                  }
                }
              />
              }
              {this.state.graphData.length === 0 &&
                <p>Loading graph data, please wait.</p>
              }
            </Col>
          </Row>
          {this.state.graphData.length > 0 &&
          <Row>
            <Col>
              <Button theme="primary" onClick={this.hideGraph} className="mt-2 mb-2 mr-1">
                Back to configure graph
              </Button>
            </Col>
          </Row>
          }
        </div>
        }
      </div>
    );
  }
}

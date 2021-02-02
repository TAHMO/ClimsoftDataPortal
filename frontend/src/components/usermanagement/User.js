import React from "react";
import {
  Button,
  Card, CardBody, CardHeader,
  Col, FormCheckbox, FormInput, FormSelect, InputGroup, InputGroupAddon, InputGroupText,
  Row,
} from "shards-react";

import axios from 'axios';
import PageTitle from "../common/PageTitle";
import RangeDatePicker from "../common/RangeDatePicker";
import _ from "lodash";
import Store from "../../flux/store";
import Constants from "../../flux/constants";
import Dispatcher from "../../flux/dispatcher";
import Redirect from "react-router-dom/es/Redirect";

export default class UserOverview extends React.Component {
  constructor(props) {
    super(props);

    this.dateRangeReference = React.createRef();

    this.handleVariableChange = this.handleVariableChange.bind(this);
    this.handleStationChange = this.handleStationChange.bind(this);
    this.handleAggregationChange = this.handleAggregationChange.bind(this);

    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);

    this.updateStations = this.updateStations.bind(this);
    this.updateVariables = this.updateVariables.bind(this);

    this.state = {
      submitLabel: "Create user",
      redirect: false,
      variables: { 'ap': true, 'pr': true, 'rh': true, 'ra': true, 'te': true, 'wd': true, 'wg': true, 'ws': true },
      aggregationOptions: Store.getAggregations(),
      aggregations: {},
      variableList: [],
      stations: {},
      stationList: [],
      filterString: '',
      filterSelected: 'disabled',
      description: '',
      multiSelect: false,
      userId: null,
      userType: "trial",
      user: null,
      name: "",
      email: "",
      organisation: "",
      role: "user",
      notify: "welcome",
      aggregationAccess: "unlimited",
      variableAccess: "standard",
      periodAccess: "unlimited",
      stationAccess: "unlimited"
    };
  }

  change(key, value) {
    const newState = {};
    newState[key] = value;
    this.setState({ ...this.state, ...newState });
  }

  submit() {
    let stations = [];
    let variables = [];
    let aggregations = [];
    const dateRangeReference = this.dateRangeReference.current;
    let startDate = null;
    let endDate = null;

    for (const station of Object.keys(this.state.stations)) {
      if (this.state.stations[station]) {
        stations.push(station);
      }
    }

    for (const variable of Object.keys(this.state.variables)) {
      if (this.state.variables[variable]) {
        variables.push(variable);
      }
    }

    for (const aggregation of Object.keys(this.state.aggregationOptions)) {
      if (this.state.aggregations[aggregation]) {
        aggregations.push(aggregation);
      }
    }

    if (dateRangeReference && dateRangeReference.state.startDate && dateRangeReference.state.startDate instanceof Date) {
      startDate = dateRangeReference.state.startDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.startDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.startDate.getDate()).slice(-2) + 'T00:00:00.000Z';
    }
    if (dateRangeReference && dateRangeReference.state.endDate && dateRangeReference.state.endDate instanceof Date) {
      endDate = dateRangeReference.state.endDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.endDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.endDate.getDate()).slice(-2) + 'T23:59:59.000Z';
    }

    const accessObject = {
      stations: {
        unlimited: (this.state.stationAccess === "unlimited"),
        specific: (this.state.stationAccess === "stations" || this.state.stationAccess === "specific") ? stations : []
      },
      variables: {
        unlimited: (this.state.variableAccess === "unlimited"),
        standard: (this.state.variableAccess === "standard"),
        specific: (this.state.variableAccess === "specific") ? variables : [],
      },
      period: {
        unlimited: (this.state.periodAccess === "unlimited"),
        startDate: (this.state.periodAccess === "specific" && startDate) ? startDate : null,
        endDate: (this.state.periodAccess === "specific") ? endDate : endDate,
      },
      aggregation: {
        unlimited: (this.state.aggregationAccess === "unlimited"),
        specific: (this.state.aggregationAccess === "specific") ? aggregations : [],
      },
    };

    const user = {
      name: this.state.name,
      company: this.state.organisation,
      email: this.state.email.trim(),
      role: this.state.role,
      userType: this.state.userType,
      notify: this.state.notify,
      access: accessObject
    };

    axios(
      {
        url: "/users" + ((this.state.userId) ? ("/" + this.state.userId) : ""),
        method: (this.state.userId) ? "PUT" : "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: user
      }
    )
      .then(response => response.data)
      .then(response => {
        if (response.status === "success") {
          this.setState({ redirect: true });
        } else {
          alert('User create failed:\n' + response.error);
        }
      })
      .catch(function(err) {
        alert('User create failed.');
      });
  }


  handleVariableChange(e, variable) {
    const newState = { 'variables': this.state.variables };
    newState['variables'][variable] = !this.state['variables'][variable];
    this.setState({ ...this.state, ...newState });
  }

  handleStationChange(e, stationCode) {
    const newState = { 'stations': this.state.stations };
    newState['stations'][stationCode] = !this.state['stations'][stationCode];
    this.setState({ ...this.state, ...newState });
  }

  handleAggregationChange(e, aggregationCode) {
    const newState = { 'aggregations': this.state.aggregations };
    newState['aggregations'][aggregationCode] = !this.state['aggregations'][aggregationCode];
    this.setState({ ...this.state, ...newState });
  }

  handleMultiSelectChange() {
    let targetValue = (this.state.multiSelect) ? false : true;
    let stations = this.state.stations;

    this.state.stationList.filter(e => ((e.location.name.toLowerCase().includes(this.state.filterString) || e.code.toLowerCase().includes(this.state.filterString))  && (this.state.filterSelected === 'disabled' || this.state.stations[e.code]))).map((station) => {
      stations[station.code] = targetValue;
    });

    const newState = { multiSelect: targetValue, stations: stations };
    this.setState({ ...this.state, ...newState });
  }

  componentDidMount() {
    if (this.props.id) {
      this.setState({userId: this.props.id, submitLabel: "Edit user" });
      axios.get(
        "/users/" + this.props.id
      )
        .then(response => response.data)
        .then(response => {
          if(response.user) {
            this.setState({
              user: response.user,
              name: response.user.profile.name,
              organisation: response.user.profile.company,
              email: response.user.email,
              role: response.user.role,
              userType: (response.user.userType) ? response.user.userType : "trial",
              notify: ""
            });

            if (response.user.access) {
              const access = response.user.access;
              this.setState({
                aggregationAccess: (access.aggregation.unlimited) ? "unlimited" : "specific",
                variableAccess: (access.variables.unlimited) ? "unlimited" : ((access.variables.standard) ? "standard" : "specific"),
                periodAccess: (access.period.unlimited) ? "unlimited" : "specific",
                stationAccess: (access.stations.unlimited) ? "unlimited" : "specific",
                variables: _.zipObject(access.variables.specific, access.variables.specific.map(x => true)),
                stations: _.zipObject(access.stations.specific, access.stations.specific.map(x => true)),
                aggregations: _.zipObject(access.aggregation.specific, access.aggregation.specific.map(x => true)),
              });

              if (access.period.unlimited === false && this.dateRangeReference) {
                // Set dates in datepicker.
                this.dateRangeReference.current.setDates(access.period.startDate, access.period.endDate);
              }
            }
          }
        });
    }

    Dispatcher.dispatch({
      actionType: Constants.CHECK_INIT
    });
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
  }

  componentWillMount() {
    Store.on(Constants.EVENT_STATIONS_READY, this.updateStations);
    Store.on(Constants.EVENT_VARIABLES_READY, this.updateVariables);
  }

  componentWillUnmount() {
    Store.removeListener(Constants.EVENT_STATIONS_READY, this.updateStations);
    Store.removeListener(Constants.EVENT_VARIABLES_READY, this.updateVariables);
  }

  render() {
    if (this.state.redirect === true) {
      return <Redirect to='/user-management' />
    }

    return (
      <div id="user-overview">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title="User" subtitle={this.state.submitLabel} className="text-sm-left" />
        </Row>

        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">General</h6>
              </CardHeader>
              <CardBody className="pt-0">
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Name
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <FormInput
                      placeholder=""
                      value={this.state.name}
                      onChange={e => this.change("name", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Email
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <FormInput
                      placeholder=""
                      value={this.state.email}
                      onChange={e => this.change("email", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Organisation
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <FormInput
                      placeholder=""
                      value={this.state.organisation}
                      onChange={e => this.change("organisation", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    Role
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <FormSelect value={this.state.role} onChange={e => this.change("role", e.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
              <Row>
                <Col sm="3" className="d-flex mb-2 mt-3">
                  Notify by email
                </Col>
                <Col sm="3" className="d-flex mb-2 mt-2">
                  <InputGroup>
                    <FormSelect value={this.state.notify} onChange={e => this.change("notify", e.target.value)}>
                      <option value="">None</option>
                      <option value="welcome">Welcome</option>
                      <option value="update">Access update</option>
                      <option value="migration">Migration</option>
                    </FormSelect>
                  </InputGroup>
                </Col>
              </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Access</h6>
              </CardHeader>
              <CardBody className="pt-0">
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    Data sets / aggregation
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <FormSelect value={this.state.aggregationAccess}
                                  onChange={e => this.change("aggregationAccess", e.target.value)}>
                        <option value="unlimited">All</option>
                        <option value="specific">Specific</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
                {this.state.aggregationAccess === "specific" &&
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Specify data sets
                  </Col>
                  <Col sm="4" md="3" className="mb-2 mt-2">
                    <fieldset>
                      {Object.keys(this.state.aggregationOptions).map((aggregationKey) => {
                        return (
                          <FormCheckbox checked={this.state.aggregations[aggregationKey]}
                                        onChange={e => this.handleAggregationChange(e, aggregationKey)}>{this.state.aggregationOptions[aggregationKey]}</FormCheckbox>
                        )
                      })}
                    </fieldset>
                  </Col>
                </Row>
                }
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    Variables
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <FormSelect value={this.state.variableAccess}
                                  onChange={e => this.change("variableAccess", e.target.value)}>
                        <option value="unlimited">All</option>
                        <option value="standard">Standard</option>
                        <option value="specific">Specific</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
                {this.state.variableAccess === "specific" &&
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Specify variables
                  </Col>
                  <Col sm="4" md="3" className="mb-2 mt-2">
                    <strong className="text-muted d-block mb-2">Standard variables</strong>
                    <fieldset>
                      {this.state.variableList.filter(variable => variable.standard === true).map((variable) => {
                        return (
                          <FormCheckbox checked={this.state.variables[variable.shortcode]}
                                        onChange={e => this.handleVariableChange(e, variable.shortcode)}>{variable.description}</FormCheckbox>
                        )
                      })}
                    </fieldset>
                  </Col>
                  {this.state.variableList.filter(variable => variable.standard === false).length > 0 &&
                  <Col sm="4" md="3" className="mb-2 mt-2">
                    <strong className="text-muted d-block mb-2">Other variables</strong>
                    <fieldset>
                      {this.state.variableList.filter(variable => variable.standard === false).map((variable) => {
                        return (
                          <FormCheckbox checked={this.state.variables[variable.shortcode]}
                                        onChange={e => this.handleVariableChange(e, variable.shortcode)}>{variable.description}</FormCheckbox>
                        )
                      })}
                    </fieldset>
                  </Col>
                  }
                </Row>
                }
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    Period
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <FormSelect value={this.state.periodAccess}
                                  onChange={e => this.change("periodAccess", e.target.value)}>
                        <option value="unlimited">All</option>
                        <option value="specific">Specific</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
                {this.state.periodAccess === "specific" &&
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    Specify period
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <RangeDatePicker ref={this.dateRangeReference}/>
                  </Col>
                </Row>
                }
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    Stations
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <FormSelect value={this.state.stationAccess}
                                  onChange={e => this.change("stationAccess", e.target.value)}>
                        <option value="unlimited">All</option>
                        <option value="stations">Choose individual stations</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {((this.state.stationAccess === "stations" || this.state.stationAccess === "specific")) &&
        <Row>
          <Col>
            <Card small className="mb-2">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Specify individual stations</h6>
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
                  <Col sm="2" className="d-flex mb-2 mt-3">
                    <InputGroup className="mb-3">
                      <InputGroupAddon type="prepend">
                        <InputGroupText>Show only selected</InputGroupText>
                      </InputGroupAddon>
                      <FormSelect onChange={e => this.change("filterSelected", e.target.value)}>
                        <option value={"disabled"}>Disabled</option>
                        <option value={"enabled"}>Enabled</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
                <table className="table mb-0">
                  <thead className="bg-light">
                  <tr>
                    <th scope="col" className="border-0">
                      <FormCheckbox className="mb-0" checked={this.state.multiSelect}
                                    onChange={e => this.handleMultiSelectChange(e)}/>
                    </th>
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
                  {this.state.stationList.filter(e => ((e.location.name.toLowerCase().includes(this.state.filterString) || e.code.toLowerCase().includes(this.state.filterString)) && (this.state.filterSelected === 'disabled' || this.state.stations[e.code]))).map((station) => {
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
          </Col>
        </Row>
        }
        <Button theme="primary" onClick={this.submit} className="mb-4 mr-1">
          {this.state.submitLabel}
        </Button>
      </div>
    );
  }
}

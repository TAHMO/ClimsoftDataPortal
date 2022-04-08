import React from "react";
import _ from "lodash";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText, FormSelect, FormCheckbox, FormGroup, FormInput, Form
} from "shards-react";

import axios from 'axios';
import { Store, Dispatcher, Constants } from "../../flux";
import PageTitle from "../common/PageTitle";
import RangeDatePicker from "../common/RangeDatePicker";
import i18next from 'i18next';

export default class ExportCreate extends React.Component {
  constructor(props) {
    super(props);
    this.dateRangeReference = React.createRef();

    this.handleVariableChange = this.handleVariableChange.bind(this);
    this.handleStationChange = this.handleStationChange.bind(this);
    this.startExport = this.startExport.bind(this);
    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);

    this.updateStations = this.updateStations.bind(this);
    this.updateVariables = this.updateVariables.bind(this);

    this.state = {
      show: false,
      startDate: '',
      endDate: '',
      variables: {},
      variableList: [],
      stations: {},
      stationList: [],
      filterString: '',
      description: '',
      multiSelect: false,
      minDate: new Date('1990-01-01'),
      maxDate: new Date(),
      timezone: 'UTC'
    };
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

  handleMultiSelectChange() {
    let targetValue = (this.state.multiSelect) ? false : true;
    let stations = this.state.stations;

    this.state.stationList.filter(e => ((e.location.name.toLowerCase().includes(this.state.filterString) || e.code.toLowerCase().includes(this.state.filterString)))).map((station) => {
      stations[station.code] = targetValue;
    });

    const newState = { multiSelect: targetValue, stations: stations };
    this.setState({ ...this.state, ...newState });
  }

  change(key, value) {
    const newState = {};
    newState[key] = value;
    if(key == 'filterString') {
      newState['multiSelect'] = false;
    }
    this.setState({ ...this.state, ...newState });
  }

  startExport(event) {
    const newState = { 'show': true };
    this.setState({ ...this.state, ...newState });
  }

  submit() {
    let errors = [];
    const dateRangeReference = this.dateRangeReference.current;

    let exportConfig = {
      'variables': [],
      'stations': [],
      'startDate': null,
      'endDate': null
    };

    // Validation.
    // Check date range.
    if (!dateRangeReference.state.startDate || !dateRangeReference.state.startDate instanceof Date) {
      errors.push('Invalid start date');
    }
    if (!dateRangeReference.state.endDate || !dateRangeReference.state.endDate instanceof Date) {
      errors.push('Invalid end date');
    }

    for (const station of Object.keys(this.state.stations)) {
      if (this.state.stations[station]) {
        exportConfig.stations.push(station);
      }
    }

    for (const variable of Object.keys(this.state.variables)) {
      if (this.state.variables[variable] && this.state.variableList.find(element => element.shortcode == variable)) {
        exportConfig.variables.push(variable);
      }
    }

    if (exportConfig.stations.length == 0) {
      errors.push('There are no stations selected.');
    }

    if (exportConfig.variables.length == 0) {
      errors.push('There are no variables selected.');
    }

    if (errors.length > 0) {
      alert('Data export failed:\n' + errors.join('\n'));
      return false;
    } else {
      exportConfig.startDate = dateRangeReference.state.startDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.startDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.startDate.getDate()).slice(-2) + 'T00:00:00.000Z';
      exportConfig.endDate = dateRangeReference.state.endDate.getFullYear() + "-" + ("0"+(dateRangeReference.state.endDate.getMonth()+1)).slice(-2) + "-" + ("0" + dateRangeReference.state.endDate.getDate()).slice(-2) + 'T23:59:59.000Z';
      exportConfig.description = this.state.description;

      axios(
        {
          url: "/export",
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: exportConfig
        }
      )
        .then(response => response.data)
        .then(response => {
          if (response.status === "success") {
            window.location.reload();
          } else {
            alert('Data export failed:\n' + response.error);
          }
        })
        .catch(function(err) {
          alert('Data export failed.');
        });
    }
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

  componentDidMount() {
    Dispatcher.dispatch({
      actionType: Constants.CHECK_INIT
    });
  }

  render() {
    return (
      <div id="export-create">
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={i18next.t('export.settings_page_title')} subtitle="" className="text-sm-left" />
        </Row>
        {!this.state.show &&
        <Row>
          <Col>
            <p onClick={this.startExport}><a href="#export-create">{i18next.t('export.click_here')}</a> {i18next.t('export.start_new')}.</p>
          </Col>
        </Row>
        }
        {this.state.show &&
        <div>
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">{i18next.t('export.settings_block_title')}</h6>
              </CardHeader>
              <CardBody className="pt-0">
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    {i18next.t('common.period')}
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <RangeDatePicker ref={this.dateRangeReference} minDate={this.state.minDate} maxDate={this.state.maxDate} />
                  </Col>
                </Row>
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    {i18next.t('export.variables')}
                  </Col>
                  <Col sm="4" md="3" className="mb-2 mt-2">
                    <strong className="text-muted d-block mb-2">{i18next.t('common.standard_variables')}</strong>
                    <fieldset>
                      {this.state.variableList.filter(variable => variable.standard === true).map((variable) => {
                        return (
                          <FormCheckbox checked={this.state.variables[variable.shortcode]} onChange={e => this.handleVariableChange(e, variable.shortcode)}>{variable.description}</FormCheckbox>
                        )
                      })}
                    </fieldset>
                  </Col>
                  {this.state.variableList.filter(variable => variable.standard === false).length > 0 &&
                  <Col sm="4" md="3" className="mb-2 mt-2">
                    <strong className="text-muted d-block mb-2">{i18next.t('common.other_variables')}</strong>
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
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3">
                    {i18next.t('common.timezone')}
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <InputGroup>
                      <InputGroupAddon type="prepend">
                        <InputGroupText>TZ</InputGroupText>
                      </InputGroupAddon>
                      <FormSelect onChange={e => this.change("timezone", e.target.value)}>
                        <option selected={(this.state.timezone == "UTC") ? "selected" : ""} value="UTC">{i18next.t('common.timezone_utc')}</option>
                        <option selected={(this.state.timezone == "EAT") ? "selected" : ""} value="EAT">{i18next.t('common.timezone_eat')}</option>
                      </FormSelect>
                    </InputGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm="3" className="d-flex mb-3 mt-3">
                    {i18next.t('common.description')}
                  </Col>
                  <Col sm="3" className="d-flex mb-2 mt-2">
                    <FormInput
                      placeholder=""
                      onChange={e => this.change("description", e.target.value)}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card small className="mb-2">
              <CardHeader className="border-bottom">
                <h6 className="m-0">{i18next.t('common.stations')}</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <Row className="border-bottom">
                  <Col sm="3" className="d-flex mb-2 mt-3 ml-3">
                    <InputGroup className="mb-3">
                      <InputGroupAddon type="prepend">
                        <InputGroupText>{i18next.t('common.filter')}</InputGroupText>
                      </InputGroupAddon>
                      <FormInput onChange={e => this.change("filterString", e.target.value.toLowerCase())} placeholder={i18next.t('common.filter_description')} />
                    </InputGroup>
                  </Col>
                </Row>
                <table className="table mb-0">
                  <thead className="bg-light">
                  <tr>
                    <th scope="col" className="border-0">
                      <FormCheckbox className="mb-0" checked={this.state.multiSelect} onChange={e => this.handleMultiSelectChange(e)}/>
                    </th>
                    <th scope="col" className="border-0">
                      {i18next.t('common.station_id')}
                    </th>
                    <th scope="col" className="border-0">
                      {i18next.t('common.location_name')}
                    </th>
                    <th scope="col" className="border-0">
                      {i18next.t('common.latitude')}
                    </th>
                    <th scope="col" className="border-0">
                      {i18next.t('common.longitude')}
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.state.stationList.filter(e => ((e.location.name.toLowerCase().includes(this.state.filterString) || e.code.toLowerCase().includes(this.state.filterString)))).map((station) => {
                    return (
                    <tr>
                      <td><FormCheckbox className="mb-0" checked={this.state.stations[station.code]} onChange={e => this.handleStationChange(e, station.code)}/></td>
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
              {i18next.t('export.create_button')}
            </Button>
          </Col>
        </Row>
        </div>
        }
      </div>
    );
  }
}

import React from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet"

import Store from "../../flux/store";
import 'leaflet/dist/leaflet.css';
import Constants from "../../flux/constants";
import Dispatcher from "../../flux/dispatcher";
import L from 'leaflet';
import _ from "lodash";
import {
  Button,
  Col, FormSelect,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row
} from "shards-react";
import PageTitle from "../common/PageTitle";
import axios from "axios";
import CircleMarker from "react-leaflet/es/CircleMarker";
import i18next from 'i18next';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
    this.updateStations = this.updateStations.bind(this);
    this.updateVariables = this.updateVariables.bind(this);
    this.changeType = this.changeType.bind(this);

    this.state = {
      bounds: [
        [-11.710923, 41.137109],
        [-26.2891802,52.3832053]
      ],
      stationList: [],
      variableList: [],
      valueList: {},
      detailsList: {},
      colorList: {},
      type: "",
      activeType: "",
      activeUnit: "",
      valueActive: false,
      detailsActive: false
    };
  }

  updateStations() {
    const stationList = Store.getStations();
    this.setState({ 'stationList': stationList });
  }

  updateVariables() {
    const accessVariableCodes = Store.getAccessVariableCodes();
    const variableList = Store.getVariables().filter(function(variable){ return accessVariableCodes.indexOf(variable.shortcode) !== -1; });
    this.setState({ 'variableList': variableList });
  }

  changeType(value) {
    const newState = {};
    newState['type'] = value;
    this.setState(newState);
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

  submit() {
    let errors = [];

    let mapConfig = {
      'type': this.state.type
    };

    if (mapConfig.type === '' || mapConfig.type === 'hydro') {
      //  No request required.
      this.setState({ activeType: mapConfig.type, valueActive: false, detailsActive: false });
    } else if (errors.length > 0) {
      alert('Map update failed:\n' + errors.join('\n'));
      return false;
    } else {
      axios(
        {
          url: "/map",
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: mapConfig
        }
      )
        .then(response => response.data)
        .then(response => {
          if (!response.error) {
            this.setState({ valueList: response, valueActive: true });
            this.setState(
              {
                activeType: response.type,
                activeUnit: response['variable'] ? this.state.variableList.find(v => v.shortcode == response['variable'])['units'] : "",
                colorList: response.colors,
                valueList: response.values,
                detailsList: response.details,
                valueActive: response.valueActive,
                detailsActive: response.detailsActive
              }
            );
          } else {
            alert('Creating map failed:\n' + response.error);
          }
        })
        .catch(function(err) {
          alert('Creating map failed.');
        });
    }
  }

  render() {
    return (
      <div>
        <div style={{marginLeft: "24px"}}>
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title={i18next.t('map.settings_page_title')} subtitle="" className="text-sm-left"/>
          </Row>
          <Row noGutters>
            <Col sm="3" className="d-flex mb-2 mt-2">
              <InputGroup>
                <InputGroupAddon type="prepend">
                  <InputGroupText>{i18next.t('map.layer')}</InputGroupText>
                </InputGroupAddon>
                <FormSelect onChange={e => this.changeType(e.target.value)}>
                  <option value={""} >{i18next.t('map.layer_locations')}</option>
                  <option value={"hydro"} >{i18next.t('map.layer_locations_hydro')}</option>
                  <option value={"availability"} >{i18next.t('map.layer_availability')}</option>
                  <option value={"pressuretrend"}>{i18next.t('map.layer_pressuretrend')}</option>
                  <option value={"30dayprecipitation"}>{i18next.t('map.layer_30dayprecipitation')}</option>
                  <option value={"7daytempmin"}>{i18next.t('map.layer_7daytempmin')}</option>
                  <option value={"7daytempmax"}>{i18next.t('map.layer_7daytempmax')}</option>
                </FormSelect>
              </InputGroup>
            </Col>
            <Col sm="3" className="d-flex ml-2">
              <Button theme="primary" onClick={this.submit} className="mt-2 mb-2 mr-1">
                {i18next.t('map.update')}
              </Button>
            </Col>
          </Row>
        </div>
        <Map bounds={this.state.bounds} style={{height: "calc(100vh - 126px)"}} maxZoom={12}>
          {/*<TileLayer*/}
            {/*attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'*/}
            {/*url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"*/}
          {/*/>*/}
          <TileLayer
            attribution='Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!this.state.valueActive && !this.state.detailsActive && this.state.stationList.map((station) => {
            if ((!this.state.activeType && station.meteo) || (this.state.activeType === 'hydro' && station.hydro)) {
              return (
                <Marker
                  position={[station.location.latitude, station.location.longitude]}>
                  <Popup>
                    <p>
                      {`${station.code} ${station.location.name}`}
                      <br/>
                      {`Latitude: ${station.location.latitude}, Longitude: ${station.location.longitude}`}
                    </p>
                  </Popup>
                </Marker>
              )
            }
          })}
          {this.state.detailsActive && this.state.stationList.map((station) => {
            if (!station.meteo) {
              return;
            }

            let message = ``;
            const color = (this.state.colorList[station.code]) ? this.state.colorList[station.code] : 'lightgray';
            message = (!this.state.detailsList[station.code]) ? i18next.t('map.no_data') : `${this.state.detailsList[station.code].min.substring(0,10).split('-').reverse().join('-')} ${i18next.t('map.up_to')} ${this.state.detailsList[station.code].max.substring(0,10).split('-').reverse().join('-')}`;
            if (this.state.detailsList[station.code] && !this.state.detailsList[station.code].qc) {
              message += i18next.t('map.qc_missing');
            }

            return (
              <CircleMarker center={[station.location.latitude, station.location.longitude]} fillColor={color} color={"black"} weight={1} fillOpacity={1} radius={6}>
                <Popup>
                  <p>
                    {`${station.code} ${station.location.name}`}
                    <br />
                    {`${message}`}
                    <br />
                  </p>
                  {this.state.detailsList[station.code] && Object.keys(this.state.detailsList[station.code].variables).map((variable) => {
                    const variableInfo = this.state.variableList.find(v => v.shortcode == variable);
                    if (variableInfo) {
                      return (
                        <p>{variableInfo['description']}: {this.state.detailsList[station.code]['variables'][variable].min.substring(0,10).split('-').reverse().join('-')} {i18next.t('map.up_to')} {this.state.detailsList[station.code]['variables'][variable].max.substring(0,10).split('-').reverse().join('-')}</p>
                      )
                    }
                  })}
                </Popup>
              </CircleMarker>
            )
          })}
          {this.state.valueActive && this.state.stationList.filter(s => this.state.valueList[s.code] !== undefined).map((station) => {
            const value = this.state.valueList[station.code];

            let lightness = (100 - Math.min(100, (value / 3))).toFixed(0);
            let color = `	hsl(240, 60%, ${lightness}%)`;

            if (this.state.activeType == 'pressuretrend') {
              lightness = (100 - Math.min(100, (Math.abs(value) * 20))).toFixed(0);
              if (value < 0) {
                color = `	hsl(0, 90%, ${lightness}%)`;
              } else {
                color = `	hsl(240, 60%, ${lightness}%)`;
              }
            } else if (this.state.activeType == '7daytempmin' || this.state.activeType == '7daytempmax') {
              const colorValue = (this.state.activeType == '7daytempmin') ? (value - 10) * 3 : (value - 20) * 3;

              lightness = (100 - Math.min(100, colorValue)).toFixed(0);
              color = `	hsl(0, 90%, ${lightness}%)`;
            }

            return (
              <CircleMarker center={[station.location.latitude, station.location.longitude]} fillColor={color} color={"black"} weight={1} fillOpacity={1} radius={6}>
                <Popup>
                  <span>{`${station.code} ${station.location.name}: ${value.toFixed(1)} ${this.state.activeUnit}`}</span>
                </Popup>
              </CircleMarker>
            )
          })}
        </Map>
      </div>
    );
  }
}

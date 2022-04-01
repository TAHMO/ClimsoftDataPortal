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
    this.changeType = this.changeType.bind(this);

    this.state = {
      bounds: [
        [-11.710923, 41.137109],
        [-26.2891802,52.3832053]
      ],
      stationList: [],
      availableCountries: [],
      valueList: {},
      valueActive: false
    };
  }

  updateStations() {
    const stationList = Store.getStations();
    const availableCountries = _.uniq(_.map(stationList, function(station){ return station.location.countrycode; }));
    this.setState({ 'stationList': stationList, 'availableCountries': availableCountries });
  }

  changeType(value) {
    const newState = {};
    newState['type'] = value;
    this.setState(newState);
  }

  componentWillMount() {
    Store.on(Constants.EVENT_STATIONS_READY, this.updateStations);
  }

  componentWillUnmount() {
    Store.removeListener(Constants.EVENT_STATIONS_READY, this.updateStations);
  }

  componentDidMount() {
    Dispatcher.dispatch({
      actionType: Constants.CHECK_INIT
    });
  }

  submit() {
    let errors = [];
    // const dateRangeReference = this.dateRangeReference.current;

    let mapConfig = {
      'variable': "pr",
      'stations': [],
      'startDate': null,
      'endDate': null
    };

    // Validation.
    // Check date range.
    // if (!dateRangeReference.state.startDate || !dateRangeReference.state.startDate instanceof Date) {
    //   errors.push('Invalid start date');
    // }
    // if (!dateRangeReference.state.endDate || !dateRangeReference.state.endDate instanceof Date) {
    //   errors.push('Invalid end date');
    // }

    for (const station of this.state.stationList) {
      mapConfig.stations.push(station.id);
    }

    if (mapConfig.stations.length == 0) {
      errors.push('There are no stations selected.');
    }

    if (errors.length > 0) {
      alert('Map update failed:\n' + errors.join('\n'));
      return false;
    } else {
      mapConfig.startDate = "2020-12-01T00:00:00Z";
      mapConfig.endDate = "2020-12-31T23:59:00Z";
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
            <PageTitle sm="4" title={`Map configuration`} subtitle="" className="text-sm-left"/>
          </Row>
          <Row noGutters>
            <Col sm="3" className="d-flex mb-2 mt-2">
              <InputGroup>
                <InputGroupAddon type="prepend">
                  <InputGroupText>{i18next.t('common.variable')}</InputGroupText>
                </InputGroupAddon>
                <FormSelect onChange={e => this.changeType(e.target.value)}>
                  <option value={""} >Station locations</option>
                  <option value={"availability"} >Data availability</option>
                  <option value={"pressuretrend"}>Pressure trend (24 hour)</option>
                  <option value={"30dayprecipitation"}>Precipitation cumulative (30 day)</option>
                  <option value={"7daytempavg"}>Average temperature (7 day)</option>
                  <option value={"7daytempmin"}>Minimum temperature (7 day)</option>
                  <option value={"7daytempmax"}>Maximum temperature (7 day)</option>
                </FormSelect>
              </InputGroup>
            </Col>
            {/*<Col>
              <Button theme="primary" onClick={this.submit} className="mt-2 mb-2 mr-1">
                Update map
              </Button>
            </Col>*/}
          </Row>
        </div>
        <Map bounds={this.state.bounds} style={{height: "calc(100vh - 126px)"}} maxZoom={11}>
          {/*<TileLayer*/}
            {/*attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'*/}
            {/*url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"*/}
          {/*/>*/}
          <TileLayer
            attribution='Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!this.state.valueActive && this.state.stationList.map((station) => {
            return (
              <Marker position={[station.location.latitude, station.location.longitude]}>
                <Popup>
                  <span>{`${station.code} ${station.location.name}`}</span>
                </Popup>
              </Marker>
            )
          })}
          {this.state.valueActive && this.state.stationList.filter(s => this.state.valueList[s.code] !== undefined).map((station) => {
            const value = this.state.valueList[station.code];
            const lightness = (100 - Math.min(100, (value / 3))).toFixed(0);
            const color = `	hsl(240, 60%, ${lightness}%)`;

            return (
              <CircleMarker center={[station.location.latitude, station.location.longitude]} fillColor={color} color={"black"} weight={1} fillOpacity={1} radius={6}>
                <Popup>
                  <span>{`${station.code} ${station.location.name}: ${value.toFixed(1)}`}</span>
                </Popup>
              </CircleMarker>
            )
          })}
        </Map>
      </div>
    );
  }
}

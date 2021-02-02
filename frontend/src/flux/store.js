import { EventEmitter } from "events";

import Dispatcher from "./dispatcher";
import Constants from "./constants";
import getSidebarNavItems from "../data/sidebar-nav-items";
import axios from 'axios';

let _store = {
  menuVisible: false,
  navItems: getSidebarNavItems(),
  stations: [],
  variables: [],
  stationAccess: [],
  variableAccess: [],
  user: {},
  initInProgress: false,
  initCompleted: false,
  aggregation: {
    "1H": "Hourly",
    "1D": "Daily",
    "1M": "Monthly"
  }
};

class Store extends EventEmitter {
  constructor() {
    super();

    this.registerToActions = this.registerToActions.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);

    Dispatcher.register(this.registerToActions.bind(this));

    // Run init to retrieve stations, variables and user.
    this.init();
  }

  registerToActions({ actionType, payload }) {
    switch (actionType) {
      case Constants.TOGGLE_SIDEBAR:
        this.toggleSidebar();
        break;
      case Constants.CHECK_INIT:
        this.checkInit();
        break;
      case Constants.GET_STATIONS:
        this.retrieveStations();
        break;
      default:
    }
  }

  toggleSidebar() {
    _store.menuVisible = !_store.menuVisible;
    this.emit(Constants.CHANGE);
  }

  getMenuState() {
    return _store.menuVisible;
  }

  getSidebarItems() {
    let navItems = _store.navItems;
    if (!_store.user.role || _store.user.role !== "admin") {
      navItems = navItems.filter(item => !item.adminOnly);
    }
    if (!_store.user.groupRole || _store.user.groupRole !== "moderator") {
      navItems = navItems.filter(item => !item.moderatorOnly);
    }

    return navItems;
  }

  checkInit() {
    if (_store.initCompleted) {
      this.emit(Constants.EVENT_STATIONS_READY);
      this.emit(Constants.EVENT_VARIABLES_READY);
      this.emit(Constants.EVENT_USER_READY);
    } else if (!_store.initInProgress) {
      this.init();
    }
  }

  init() {
    _store.initInProgress = true;
    axios.get(
      "/init"
    )
      .then(response => response.data)
      .then(response => {
        _store.stations = response.stations;
        _store.stationAccess = response.stationAccess;
        this.emit(Constants.EVENT_STATIONS_READY);

        _store.variables = response.variables;
        _store.variableAccess = response.variableAccess;
        this.emit(Constants.EVENT_VARIABLES_READY);

        _store.user = response.user;
        this.emit(Constants.EVENT_USER_READY);
        this.emit(Constants.CHANGE);

        _store.initInProgress = false;
        _store.initCompleted = true;
      });
  }

  retrieveStations() {
    if(_store.stations.length > 0) {
      this.emit(Constants.EVENT_STATIONS_READY);
    } else {
      axios.get(
        "/services/assets/v2/stations?sort=code"
      )
        .then(response => response.data)
        .then(response => {
          _store.stations = response.data;
          this.emit(Constants.EVENT_STATIONS_READY);
        });
    }
  }

  getStations() {
    return _store.stations;
  }

  getAccessStationCodes() {
    return _store.stationAccess;
  }

  getVariables() {
    return _store.variables;
  }

  getAccessVariableCodes() {
    return _store.variableAccess;
  }

  getAggregations() {
    return _store.aggregation;
  }

  getAccessAggregations() {
    if("access" in _store.user && "aggregation" in _store.user.access) {
      return (_store.user.access.aggregation.unlimited === true) ? Object.keys(_store.aggregation) : _store.user.access.aggregation.specific;
    } else {
      return [];
    }
  }

  getUser() {
    return _store.user;
  }

  addChangeListener(callback) {
    this.on(Constants.CHANGE, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}

export default new Store();

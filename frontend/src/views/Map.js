import React from "react";
import {
  Container,
} from "shards-react";
import Map from "../components/map/Map";
import "../assets/map.css";

const MapView = () => (
  <Container fluid className="main-content-container no-padding">
    <Map/>
  </Container>
);

export default MapView;

import React from "react";
import {
  Container,
} from "shards-react";

import GraphConfiguration from "../components/visualize/GraphConfiguration";
import "../assets/visualize.css";

const Visualize = () => (
  <Container fluid className="main-content-container px-4">
    <GraphConfiguration/>
  </Container>
);

export default Visualize;

import React from "react";
import {
  Container,
} from "shards-react";

import ExportCreate from "../components/export/ExportCreate";
import ExportTable from "../components/export/ExportTable";

const DataExport = () => (
  <Container fluid className="main-content-container px-4">
    <ExportTable/>
    <ExportCreate/>
  </Container>
);

export default DataExport;

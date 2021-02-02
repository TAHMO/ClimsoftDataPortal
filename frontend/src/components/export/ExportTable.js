import React from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
} from "shards-react";

import axios from 'axios';
import Moment from 'react-moment';
import PageTitle from "../common/PageTitle";
import Store from "../../flux/store";

export default class ExportTable extends React.Component {
  constructor(props) {
    super(props);

    this.expandList = this.expandList.bind(this);

    this.state = {
      exportList: [],
      showNumber: 5,
      aggregations: Store.getAggregations(),
      expanded: false
    };
  }

  componentDidMount() {
    this.refreshList(true);
    setInterval(this.refreshList.bind(this), 10000);
  }

  refreshList(initial) {
    if (initial || this.state.exportList.filter(item => item.status !== "completed").length > 0) {
      axios.get(
        "/export"
      )
        .then(response => response.data)
        .then(response =>
          this.setState({
            exportList: response.exports
          })
        );
    }
  }

  expandList(event) {
    const newState = { 'expanded': true, showNumber: 100 };
    this.setState({ ...this.state, ...newState });
  }

  render() {
    return (
      <div id="export-history">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title="Data export" subtitle="" className="text-sm-left" />
        </Row>

        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">
                  Export history
                  {(this.state.exportList.length > this.state.showNumber) &&
                    <span>
                    &nbsp;-&nbsp;<a href="#export-history" onClick={this.expandList}>(show all {this.state.exportList.length})</a>
                    </span>
                  }
                </h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                  {(this.state.exportList.length > 0) &&
                  <tr>
                    <th scope="col" className="border-0">
                      Created at
                    </th>
                    <th scope="col" className="border-0">
                      Description
                    </th>
                    <th scope="col" className="border-0">
                      Aggregation
                    </th>
                    <th scope="col" className="border-0">
                      Variables
                    </th>
                    <th scope="col" className="border-0">
                      Stations
                    </th>
                    <th scope="col" className="border-0">
                      Status
                    </th>
                  </tr>
                  }
                  </thead>
                  <tbody>
                  {this.state.exportList.slice(0,this.state.showNumber).map((dataExport) => {
                    return (
                      <tr>
                        <td><Moment date={dataExport.createdAt} format="YYYY-MM-DD HH:mm" /></td>
                        <td>{dataExport.description}</td>
                        <td>{this.state.aggregations[dataExport.aggregation]}</td>
                        <td>
                        {dataExport.variables.length <= 3 &&
                        <span>{dataExport.variables.join(", ")}</span>
                        }
                        {dataExport.variables.length > 3 &&
                        <span>{dataExport.variables.length} variables</span>
                        }
                        </td>
                        <td>
                        {dataExport.stations.length <= 3 &&
                        <span>{dataExport.stations.join(", ")}</span>
                        }
                        {dataExport.stations.length > 3 &&
                        <span>{dataExport.stations.length} stations</span>
                        }
                        </td>
                        {dataExport.status === "completed" &&
                        <td><a href={"/download/export/" + dataExport._id}>Download</a></td>
                        }
                        {dataExport.status !== "completed" &&
                        <td>{dataExport.status}</td>
                        }
                      </tr>
                    )
                  })}
                  {(this.state.exportList.length === 0) &&
                    <tr>
                      <td colspan="5">You haven't generated any data exports yet.</td>
                    </tr>
                  }
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

import React from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody, Button, InputGroup, InputGroupAddon, InputGroupText, FormInput, FormSelect,
} from "shards-react";

import axios from 'axios';
import PageTitle from "../common/PageTitle";
import Moment from "react-moment";
import Link from "react-router-dom/es/Link";
import _ from "lodash";

export default class UserOverview extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);

    this.state = {
      userList: [],
      demoList: [],
      filterUserType: ""
    };
  }

  change(key, value) {
    const newState = {};
    newState[key] = value;
    this.setState({ ...this.state, ...newState });
  }

  componentDidMount() {
    axios.get(
      "/users"
    )
      .then(response => response.data)
      .then(response =>
        this.setState({
          userList: response.users.filter(user => user.access),
          demoList: response.users.filter(user => !user.access)
        })
      );
  }

  render() {
    return (
      <div id="user-overview">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title="User overview" subtitle="" className="text-sm-left" />
        </Row>
        <Link to="/add-user">
          <Button theme="primary" className="mb-4 mr-1">
            Create user
          </Button>
        </Link>

        {/* Default Light Table */}
        <Row>
        <Col>
          <Card small className="mb-4">
            <CardHeader className="border-bottom">
              <h6 className="m-0">
                User list ({this.state.userList.length})
              </h6>
            </CardHeader>
            <CardBody className="p-0 pb-3">
              <table className="table mb-0">
                <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">
                    Name
                  </th>
                  <th scope="col" className="border-0" style={{"width": "30%"}}>
                    Organisation
                  </th>
                  <th scope="col" className="border-0">
                    E-mail
                  </th>
                  <th scope="col" className="border-0">
                    Created
                  </th>
                  <th scope="col" className="border-0">
                    Last active
                  </th>
                  <th scope="col" className="border-0">
                    Action
                  </th>
                </tr>
                </thead>
                <tbody>
                {this.state.userList.filter(e => (_.isEmpty(this.state.filterUserType) || e.userType === this.state.filterUserType)).map((user) => {
                  return (
                    <tr>
                      <td>
                        {user.profile.name}
                        {(user.role === "admin") &&
                        <span>&nbsp;<i className="material-icons">grade</i></span>
                        }
                      </td>
                      <td>{user.profile.company}</td>
                      <td>{user.email}</td>
                      <td>
                        {(user.createdAt) &&
                        <Moment date={user.createdAt} format="YYYY-MM-DD"/>
                        }
                      </td>
                      <td>
                        {(user.lastLogin) &&
                        <Moment date={user.lastLogin} format="YYYY-MM-DD"/>
                        }
                      </td>
                      <td><Link to={"/edit-user/" + user._id}>Edit</Link></td>
                    </tr>
                  )
                })}
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

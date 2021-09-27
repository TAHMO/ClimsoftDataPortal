import React from "react";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody, Button,
} from "shards-react";

import axios from 'axios';
import PageTitle from "../common/PageTitle";
import Moment from "react-moment";
import Link from "react-router-dom/es/Link";
import i18next from 'i18next';

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
          userList: response.users
        })
      );
  }

  render() {
    return (
      <div id="user-overview">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={i18next.t('user_management.page_title')} subtitle="" className="text-sm-left" />
        </Row>
        <Link to="/add-user">
          <Button theme="primary" className="mb-4 mr-1">
            {i18next.t('user_management.create_subtitle')}
          </Button>
        </Link>

        {/* Default Light Table */}
        <Row>
        <Col>
          <Card small className="mb-4">
            <CardHeader className="border-bottom">
              <h6 className="m-0">
                {i18next.t('user_management.table_title')} ({this.state.userList.length})
              </h6>
            </CardHeader>
            <CardBody className="p-0 pb-3">
              <table className="table mb-0">
                <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">
                    {i18next.t('user_management.table_username')}
                  </th>
                  <th scope="col" className="border-0">
                    {i18next.t('user_management.table_email')}
                  </th>
                  <th scope="col" className="border-0">
                    {i18next.t('user_management.table_last_active')}
                  </th>
                  <th scope="col" className="border-0">
                    {i18next.t('common.actions')}
                  </th>
                </tr>
                </thead>
                <tbody>
                {this.state.userList.map((user) => {
                  return (
                    <tr>
                      <td>
                        {user.profile.name}
                        {(user.role === "admin") &&
                        <span>&nbsp;<i className="material-icons">grade</i></span>
                        }
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {(user.lastLogin) &&
                        <Moment date={user.lastLogin} format="YYYY-MM-DD"/>
                        }
                      </td>
                      <td><Link to={"/edit-user/" + user._id}>{i18next.t('common.action_edit')}</Link></td>
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

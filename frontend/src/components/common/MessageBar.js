import React from "react";
import {
  Container, Alert,
} from "shards-react";
import Store from "../../flux/store";
import Constants from "../../flux/constants";

export default class MessageBar extends React.Component {
  constructor(props) {
    super(props);

    this.updateDemo = this.updateDemo.bind(this);

    this.state = {
      demo: false
    };
  }

  componentWillMount() {
    Store.on(Constants.EVENT_USER_READY, this.updateDemo);
  }

  componentWillUnmount() {
    Store.removeListener(Constants.EVENT_USER_READY, this.updateDemo);
  }

  updateDemo() {
    const user = Store.getUser();
    this.setState({ 'demo': user.demo });
  }

  render() {
    return (
      <div>
        {(this.state.demo === true) &&
        <Container fluid className="px-0 alert-message" style={{position:'relative', 'zIndex': 999}}>
          <Alert className="mb-0">
            <i className="fa fa-info mx-2"></i> Your account hasn't been configured yet, therefore you only have access to demo stations and limited datasets.
          </Alert>
        </Container>
        }
      </div>
    );
  }
}

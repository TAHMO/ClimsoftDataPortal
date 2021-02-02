import React from "react";
import {
  Container,
} from "shards-react";
import User from "../components/usermanagement/User";

class EditUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: props.match.params.id
    };
  }

  render() {
    return (
      <Container fluid className="main-content-container px-4">
        <User id={this.state.userId}/>
      </Container>
    );
  }
}

export default EditUser;

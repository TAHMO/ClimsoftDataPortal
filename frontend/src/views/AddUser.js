import React from "react";
import {
  Container,
} from "shards-react";
import User from "../components/usermanagement/User";

class AddUser extends React.Component {

  render() {
    return (
      <Container fluid className="main-content-container px-4">
        <User/>
      </Container>
    );
  }
}

export default AddUser;

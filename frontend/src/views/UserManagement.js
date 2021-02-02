import React from "react";
import {
  Container,
} from "shards-react";
import UserOverview from "../components/usermanagement/UserOverview";


const UserManagement = () => (
  <Container fluid className="main-content-container px-4">
    <UserOverview/>
  </Container>
);

export default UserManagement;

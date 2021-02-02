import React from "react";
import { Redirect } from "react-router-dom";

// Layout Types
import { DefaultLayout } from "./layouts";

// Route Views
import DataExport from "./views/DataExport";
import UserManagement from "./views/UserManagement";
import AddUser from "./views/AddUser";
import EditUser from "./views/EditUser";
import MapView from "./views/Map";
import Visualize from "./views/Visualize";

export default [
  {
    path: "/",
    exact: true,
    layout: DefaultLayout,
    component: () => <Redirect to="/map" />
  },
  // {
  //   path: "/dashboard",
  //   layout: DefaultLayout,
  //   component: BlogOverview
  // },
  // {
  //   path: "/profile",
  //   layout: DefaultLayout,
  //   component: UserProfileLite
  // },
  {
    path: "/map",
    layout: DefaultLayout,
    component: MapView
  },
  {
    path: "/visualize",
    layout: DefaultLayout,
    component: Visualize
  },
  {
    path: "/export",
    layout: DefaultLayout,
    component: DataExport
  },
  {
    path: "/user-management",
    layout: DefaultLayout,
    component: UserManagement
  },
  {
    path: "/add-user",
    layout: DefaultLayout,
    component: AddUser
  },
  {
    path: "/edit-user/:id",
    layout: DefaultLayout,
    component: EditUser
  }
];

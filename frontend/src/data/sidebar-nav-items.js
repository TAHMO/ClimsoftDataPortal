export default function() {
  return [
    // {
    //   title: "Dashboard",
    //   to: "/dashboard",
    //   htmlBefore: '<i class="material-icons">edit</i>',
    //   htmlAfter: ""
    // },
    {
      title: "Map",
      htmlBefore: '<i class="material-icons">vertical_split</i>',
      to: "/map",
    },
    {
      title: "Graphs",
      htmlBefore: '<i class="material-icons">insert_chart</i>',
      to: "/visualize",
    },
    {
      title: "Data export",
      htmlBefore: '<i class="material-icons">cloud_download</i>',
      to: "/export",
    },
    {
      title: "User management",
      htmlBefore: '<i class="material-icons">account_box</i>',
      to: "/user-management",
      adminOnly: true
    }
  ];
}

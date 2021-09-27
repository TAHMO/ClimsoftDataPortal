import i18next from 'i18next';

export default function() {
  return [
    {
      title: i18next.t('menu.map'),
      htmlBefore: '<i class="material-icons">vertical_split</i>',
      to: "/map",
    },
    {
      title: i18next.t('menu.visualize'),
      htmlBefore: '<i class="material-icons">insert_chart</i>',
      to: "/visualize",
    },
    {
      title: i18next.t('menu.export'),
      htmlBefore: '<i class="material-icons">cloud_download</i>',
      to: "/export",
    },
    {
      title: i18next.t('menu.users'),
      htmlBefore: '<i class="material-icons">account_box</i>',
      to: "/user-management",
      adminOnly: true
    }
  ];
}

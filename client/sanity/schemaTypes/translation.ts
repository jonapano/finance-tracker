export default {
  name: 'translation',
  title: 'Translations',
  type: 'document',
  // 1. Define Groups (Tabs)
  groups: [
    {name: 'config', title: 'Configuration'},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    {
      name: 'key',
      title: 'Key (Unique ID)',
      type: 'string',
      group: 'config', // 2. Assign to tab
    },
    {
      name: 'group',
      title: 'Group',
      type: 'string',
      group: 'config', // 2. Assign to tab
      options: {
        list: [
          {title: 'General UI', value: 'none'},
          {title: 'Categories', value: 'categories'},
          {title: 'Filters', value: 'filters'},
        ],
      },
    },
    {
      name: 'en',
      title: 'English (EN)',
      type: 'string',
      group: 'content', // 2. Assign to tab
    },
    {
      name: 'sq',
      title: 'Albanian (SQ)',
      type: 'string',
      group: 'content', // 2. Assign to tab
    },
  ],
}

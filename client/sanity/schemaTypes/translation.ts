export default {
  name: 'translation',
  title: 'Translations',
  type: 'document',
  groups: [
    {name: 'config', title: 'Configuration'},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    {
      name: 'key',
      title: 'Key (Unique ID)',
      type: 'string',
      group: 'config',
    },
    {
      name: 'group',
      title: 'Group',
      type: 'string',
      group: 'config',
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
      group: 'content',
    },
    {
      name: 'sq',
      title: 'Albanian (SQ)',
      type: 'string',
      group: 'content',
    },
  ],
}

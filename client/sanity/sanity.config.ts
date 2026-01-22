import {defineConfig} from 'sanity'
import {structureTool, StructureBuilder} from 'sanity/structure' // 1. Added StructureBuilder import
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  basePath: '/sanity',
  name: 'default',
  title: 'Finance Manager',
  projectId: '1sgrfji7',
  dataset: 'development',

  plugins: [
    structureTool({
      // 2. Add : StructureBuilder to the S parameter
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Finance Manager CMS')
          .items([
            S.listItem()
              .title('General UI')
              .child(
                S.documentList()
                  .title('UI Labels')
                  .filter('_type == "translation" && group == "none"'),
              ),
            S.listItem()
              .title('Categories')
              .child(
                S.documentList()
                  .title('Transaction Categories')
                  .filter('_type == "translation" && group == "categories"'),
              ),
            S.listItem()
              .title('Filters')
              .child(
                S.documentList()
                  .title('App Filters')
                  .filter('_type == "translation" && group == "filters"'),
              ),
            // 3. Add : any (or the specific type) to the listItem parameter
            ...S.documentTypeListItems().filter(
              (listItem: any) => !['translation'].includes(listItem.getId()),
            ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})

import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './src/app/api/graphql/schema.ts',
  documents: ['./src/graphql/documents/**/*.graphql'],
  generates: {
    './src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        maybeValue: 'T | null',
      },
    },
  },
  ignoreNoDocuments: false,
}

export default config

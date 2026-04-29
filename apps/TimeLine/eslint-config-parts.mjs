export const nextAppEntryFiles = [
  '*.js',
  '*.ts',
  '**/*.js',
  '**/*.ts',
  '**/pages/**/*.tsx',
  '**/pages/**/*.jsx',
  '**/app/**/page.tsx',
  '**/app/**/layout.tsx',
  '**/app/**/template.tsx',
  '**/app/**/loading.tsx',
  '**/app/**/error.tsx',
  '**/app/**/global-error.tsx',
  '**/app/**/not-found.tsx',
  'mdx-components.tsx',
];

export const defaultDepConstraints = [
  {
    sourceTag: '*',
    onlyDependOnLibsWithTags: ['*'],
  },
];

export const timelineDepConstraints = [
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:util', 'type:ui'] },
  { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:util', 'type:ui'] },
  { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
  { sourceTag: 'plugin:next', onlyDependOnLibsWithTags: ['plugin:next', 'plugin:react', 'plugin:node', 'plugin:js'] },
  { sourceTag: 'plugin:expo', onlyDependOnLibsWithTags: ['plugin:expo', 'plugin:react', 'plugin:js'] },
  { sourceTag: 'plugin:react', onlyDependOnLibsWithTags: ['plugin:react', 'plugin:js'] },
  { sourceTag: 'plugin:express', onlyDependOnLibsWithTags: ['plugin:express', 'plugin:js'] },
  { sourceTag: 'plugin:nest', onlyDependOnLibsWithTags: ['plugin:nest', 'plugin:js'] },
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'scope:int-lms-web', onlyDependOnLibsWithTags: ['scope:int-lms-web', 'scope:int-lms-api', 'scope:shared'] },
  { sourceTag: 'scope:int-lms-api', onlyDependOnLibsWithTags: ['scope:int-lms-api', 'scope:shared'] },
  { sourceTag: 'scope:int-alumnus-portfolio', onlyDependOnLibsWithTags: ['scope:int-alumnus-portfolio', 'scope:int-lms-api', 'scope:shared'] },
  { sourceTag: 'scope:int-student-detail-microservice', onlyDependOnLibsWithTags: ['scope:shared'] },
];

import type { ZnightOptions } from '@znight/compiler';

import graphql from '@znight/graphql/compiler';

export default {
  extensions: [
    graphql.configure({
      schema: 'src/**/*.graphql',
      // kept for codegen-schema-transform.ts, which drops the resolved fields from the model types
      ignoredDirectives: ['resolved'],
    }),
  ],
} satisfies ZnightOptions;

import type { ZnightOptions } from '@znight/compiler';

import graphql from '@znight/graphql/compiler';

export default {
  extensions: [graphql.configure({ schema: 'src/**/*.graphql' })],
} satisfies ZnightOptions;

import type { HelperDeclareSpec } from 'handlebars'

export const helpers: HelperDeclareSpec = {
  eq: (a, b) => a === b,
  eqNum: (a, b) => parseInt(a, 10) === parseInt(b, 10),
  ne: (a, b) => a !== b,
  neNum: (a, b) => parseInt(a, 10) !== parseInt(b, 10),
}

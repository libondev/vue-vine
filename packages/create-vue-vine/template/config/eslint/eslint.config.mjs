// @ts-check

import antfu from '@antfu/eslint-config'
import VueVine from '@vue-vine/eslint-config'

export default antfu(
  { /* Override Antfu's default settings */ },
  ...VueVine(), // Load VueVine's ESLint config
)
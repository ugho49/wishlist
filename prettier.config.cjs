module.exports = {
  singleQuote: true,
  printWidth: 120,
  $schema: "http://json.schemastore.org/prettierrc",
  semi: false,
  trailingComma: "all",
  arrowParens: "avoid",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "<TYPES>",
    "",
    "<TYPES>^[.]",
    "",
    "<BUILT_IN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[.]"
  ],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderParserPlugins: [
    "typescript",
    "jsx",
    "decorators-legacy",
    "importAssertions"
  ]
}

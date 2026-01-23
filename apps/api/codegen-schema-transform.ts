import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { globSync } from 'glob'
import { parse, print, visit } from 'graphql'

/**
 * Loads all .graphql files and removes fields marked with @resolved directive.
 * This ensures generated types don't include fields that are resolved by field resolvers.
 */
export function loadSchemaWithoutResolvedFields(): string {
  const cwd = process.cwd()
  const files = globSync('src/**/*.graphql', { cwd })

  const schemaContent = files.map(file => readFileSync(join(cwd, file), 'utf-8')).join('\n')

  // Parse the schema content as a document
  const doc = parse(schemaContent)

  // Remove @resolved fields from the AST
  const transformedDoc = visit(doc, {
    FieldDefinition(node) {
      const hasResolvedDirective = node.directives?.some(d => d.name.value === 'resolved')
      if (hasResolvedDirective) {
        return null // Remove this field
      }
      return undefined // Keep the field
    },
  })

  return print(transformedDoc)
}

// Export the transformed schema for graphql-codegen
export default loadSchemaWithoutResolvedFields()

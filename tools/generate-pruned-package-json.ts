import { writeFile } from 'node:fs/promises'
import { createProjectGraphAsync } from '@nx/devkit'
import { createPackageJson } from '@nx/js'

const projectName = process.argv[2]
const outputPath = process.argv[3]

if (!projectName || !outputPath) {
  console.error('Usage: jiti tools/generate-pruned-package-json.ts <projectName> <outputPath>')
  process.exit(1)
}

const projectGraph = await createProjectGraphAsync()

const prunedPackageJson = createPackageJson(projectName, projectGraph, {
  isProduction: true,
  root: process.cwd(),
})

delete prunedPackageJson.packageManager

await writeFile(outputPath, `${JSON.stringify(prunedPackageJson, null, 2)}\n`)

console.log(`Generated pruned package.json at ${outputPath}`)

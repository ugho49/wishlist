import fs from 'fs'
import path from 'path'

const convert = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      convert(fullPath)
    } else if (fullPath.endsWith('.ts')) {
      console.log(`Reading file: ${fullPath}`)
      let content = fs.readFileSync(fullPath, 'utf8')
      // content = content.replace(
      //   /from '(\.\/[^']*|\.{2}\/[^']*)'/g,
      //   "from '$1.js'",
      // )
      // Replace only imports that start with './' or '../' and do not already contain '.js'
      content = content.replace(/from '(\.\/[^']*|\.{2}\/[^']*)(?<!\.js)'/g, "from '$1.js'")
      fs.writeFileSync(fullPath, content, 'utf8')
    }
  })
}

// Point d'entrée
convert('./apps/api')
convert('./libs')

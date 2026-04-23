import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

const appRoot = process.cwd()
const envPath = path.join(appRoot, '.env')
const templatePath = path.join(appRoot, 'wrangler.template.jsonc')
const outputPath = path.join(appRoot, 'wrangler.jsonc')

dotenv.config({ path: envPath })

const requiredVars = ['ACADEMIC_TIMELINE_DB_ID']
const missingVars = requiredVars.filter(name => !process.env[name])

if (missingVars.length > 0) {
  throw new Error(
    `Missing required env variables in ${envPath}: ${missingVars.join(', ')}`
  )
}

const replacements = {
  '__ACADEMIC_TIMELINE_DB_ID__': process.env.ACADEMIC_TIMELINE_DB_ID,
  '__ACADEMIC_TIMELINE_DB_PREVIEW_ID__':
    process.env.ACADEMIC_TIMELINE_DB_PREVIEW_ID ??
    process.env.ACADEMIC_TIMELINE_DB_ID,
}

let config = fs.readFileSync(templatePath, 'utf8')

for (const [token, value] of Object.entries(replacements)) {
  config = config.replaceAll(token, value)
}

fs.writeFileSync(outputPath, config)
console.log(`Generated ${path.relative(appRoot, outputPath)} from ${path.relative(appRoot, templatePath)}`)

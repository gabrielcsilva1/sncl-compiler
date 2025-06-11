import path from 'node:path'
import { tokenize } from './chevrotain/lexer'
import { SnclParser } from './chevrotain/parser'
import { SnclVisitor } from './chevrotain/visitor'
import { resolveMacro } from './macros'
import { generateNCL } from './ncl/generation'
import { readFile, writeFile } from './utils/utils'
import { SnclError } from './errors/sncl-error'

export async function beginParse(file: string) {
  const { fileContent } = await readFile(file)

  const fileDir = path.dirname(file)
  const fileName = path.basename(file, path.extname(file))
  const outputPath = path.join(fileDir, fileName) + '.ncl'

  const { lexingResult } = tokenize(fileContent)

  const parser = new SnclParser()

  parser.input = lexingResult.tokens

  const cst = parser.start()

  if (parser.errors.length > 0) {
    throw new SnclError(
      `Parsing errors detected!: ${parser.errors[0].message}`,
      fileName,
      Number(parser.errors[0].token.startLine),
    )
  }

  const visitor = new SnclVisitor(fileName+'.sncl')

  visitor.visit(cst)

  resolveMacro(visitor.getSymbolsTable())

  const nclText = generateNCL(visitor.getSymbolsTable())

  writeFile({
    fileContent: nclText,
    fileName: outputPath,
  })
}

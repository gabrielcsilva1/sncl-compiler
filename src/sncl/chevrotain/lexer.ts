import { Lexer } from 'chevrotain'
import { allTokens } from './tokens'
import { SnclError } from '../errors/sncl-error'

const lexer = new Lexer(allTokens)
// TODO: Exibir o erro de forma organizada
export function tokenize(inputText: string) {
  const lexingResult = lexer.tokenize(inputText) 

  if (lexingResult.errors.length > 0) {
    throw new SnclError(
      `Lexing errors detected: ${lexingResult.errors[0].message}`, '', Number(lexingResult.errors[0].line)
    )
  }

  return { lexingResult }
}

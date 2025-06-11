import fs from 'node:fs/promises'
import { stringPattern } from './patterns'
import type { VisitorPropertyResponse } from '../@types/visitor-responses'
import { SnclError } from '../errors/sncl-error'

const controlsButtons = [
  '*',
  '#',
  'MENU',
  'INFO',
  'GUIDE',
  'CURSOR_DOWN',
  'CURSOR_LEFT',
  'CURSOR_RIGHT',
  'CURSOR_UP',
  'CHANNEL_DOWN',
  'CHANNEL_UP',
  'VOLUME_DOWN',
  'VOLUME_UP',
  'ENTER',
  'RED',
  'GREEN',
  'YELLOW',
  'BLUE',
  'BLACK',
  'EXIT',
  'POWER',
  'REWIND',
  'STOP',
  'EJECT',
  'PLAY',
  'RECORD',
  'PAUSE',
]

export function convertPropertyArrayToObject(properties: VisitorPropertyResponse[]) {
  const response: Record<string, string> = {}

  for (const property of properties) {
    const { name, value } = property
    response[name] = value
  }

  return response
}

export function isControlButton(label?: string) {
  if (!label) {
    return false
  }

  if (controlsButtons.includes(label)) {
    return true
  }

  const digitPattern = /^\d$/
  const letterPattern = /^[A-Z]$/

  const isDigitOrLetter = digitPattern.test(label) || letterPattern.test(label)

  return isDigitOrLetter
}

export async function readFile(fileName: string) {
  try {
    const fileContent = await fs.readFile(fileName, 'utf-8')

    return { fileContent }
  } catch (err) {
    throw new SnclError('File not found', fileName)
  }
}

type WriteFileParams = {
  fileName: string
  fileContent: string
}

export async function writeFile({ fileName, fileContent }: WriteFileParams) {
  try {
    await fs.writeFile(fileName, fileContent)
  } catch (err) {
    console.log('Erro ao escrever o arquivo')
  }
}

export function isStringLiteral(value: string) {
  return stringPattern.test(value)
}

export function removeQuotes(str: string) {
  if (str.startsWith('"') || str.startsWith("'")) {
    return str.slice(1, -1)
  }

  return str
}

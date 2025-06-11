import { createToken, Lexer } from 'chevrotain'
import { hexPattern, numberPattern, numberWithUnitPattern, percentagePattern, stringPattern } from '../utils/patterns'

/****************************************
 *              CATEGORIES              *
 ****************************************/
export const Argument = createToken({
  // Identifier or Value; macroCall arguments
  name: 'Argument',
  pattern: Lexer.NA,
})

export const Condition = createToken({
  name: 'Condition',
  pattern: Lexer.NA,
})

export const Action = createToken({
  name: 'Action',
  pattern: Lexer.NA,
})

/****************************************
 *               GENERAL               *
 ****************************************/

export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_]\w*/,
  label: 'id',
  categories: [Argument],
})

export const Value = createToken({
  name: 'Value',
  pattern: new RegExp(
    [
      hexPattern.source,
      stringPattern.source,
      percentagePattern.source,
      numberWithUnitPattern.source,
      numberPattern.source, // numberPattern must come after all other number patterns,
      // because it is the most generic
    ].join('|'),
  ),
  categories: [Argument],
})

/****************************************
 *               KEYWORDS               *
 ****************************************/

export const Area = createToken({
  name: 'Area',
  pattern: /area/,
  longer_alt: Identifier,
  label: 'area',
})

export const Context = createToken({
  name: 'Context',
  pattern: /context/,
  longer_alt: Identifier,
})

export const Do = createToken({
  name: 'Do',
  pattern: /do/,
  longer_alt: Identifier,
  label: 'do',
})

export const End = createToken({
  name: 'End',
  pattern: /end(?!\s*:)/,
  longer_alt: Identifier,
  label: 'end',
})

export const Macro = createToken({
  name: 'Macro',
  pattern: /macro/,
  longer_alt: Identifier,
  label: 'macro',
})

export const Media = createToken({
  name: 'Media',
  pattern: /media/,
  longer_alt: Identifier,
  label: 'media',
})

export const Port = createToken({
  name: 'Port',
  pattern: /port/,
  longer_alt: Identifier,
  label: 'port',
})

export const Region = createToken({
  name: 'Region',
  pattern: /region/,
  longer_alt: Identifier,
  label: 'region',
})

// Link - Conditions
const OnBegin = createToken({
  name: 'OnBegin',
  pattern: /onBegin/,
  longer_alt: Identifier,
  label: 'onBegin',
  categories: Condition,
})

const OnEnd = createToken({
  name: 'OnEnd',
  pattern: /onEnd/,
  longer_alt: Identifier,
  label: 'onEnd',
  categories: Condition,
})

const OnSelection = createToken({
  name: 'OnSelection',
  pattern: /onSelection/,
  longer_alt: Identifier,
  label: 'onSelection',
  categories: Condition,
})

// Link - Actions
const Start = createToken({
  name: 'Start',
  pattern: /start/,
  longer_alt: Identifier,
  label: 'start',
  categories: Action,
})

const Stop = createToken({
  name: 'Stop',
  pattern: /stop/,
  longer_alt: Identifier,
  label: 'stop',
  categories: Action,
})

// "Set" is a global identifier/ javascript class
const SetToken = createToken({
  name: 'SetToken',
  pattern: /set/,
  longer_alt: Identifier,
  label: 'set',
  categories: Action,
})

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
})

/****************************************
 *                SYMBOLS               *
 ****************************************/

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
  label: ':',
})

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
  label: ',',
})

export const Dot = createToken({
  name: 'Dot',
  pattern: /\./,
  label: '.',
})

export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
  label: '(',
})

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
  label: ')',
})

// The order of tokens is important

export const allTokens = [
  WhiteSpace,
  // categories
  Action,
  Condition,
  Argument,
  // "keywords" appear before the Identifier
  Area,
  Context,
  Do,
  End,
  Macro,
  Media,
  Port,
  Region,
  OnBegin,
  OnEnd,
  OnSelection,
  Start,
  Stop,
  SetToken,
  // The Identifier must appear after the keywords because all keywords are valid identifiers.
  Identifier,
  Value,
  // Symbols
  Colon,
  Comma,
  Dot,
  LParen,
  RParen,
]

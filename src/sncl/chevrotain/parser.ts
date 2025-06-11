import { CstParser } from 'chevrotain'
import {
  Action,
  allTokens,
  Area,
  Argument,
  Colon,
  Comma,
  Condition,
  Context,
  Do,
  Dot,
  End,
  Identifier,
  LParen,
  Macro,
  Media,
  Port,
  Region,
  RParen,
  Value,
} from './tokens'

// https://github.com/Chevrotain/chevrotain/blob/master/examples/implementation_languages/typescript/typescript_json.ts
// https://chevrotain.io/docs/tutorial/step2_parsing.html#introduction

export class SnclParser extends CstParser {
  constructor() {
    super(allTokens)

    this.performSelfAnalysis()
  }

  public start = this.RULE('start', () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.port) },
        { ALT: () => this.SUBRULE(this.media) },
        { ALT: () => this.SUBRULE(this.region) },
        { ALT: () => this.SUBRULE(this.link) },
        { ALT: () => this.SUBRULE(this.context) },
        { ALT: () => this.SUBRULE(this.macro) },
        { ALT: () => this.SUBRULE(this.macroCall) },
      ])
    })
  })

  private port = this.RULE('port', () => {
    this.CONSUME(Port)
    this.CONSUME1(Identifier)
    this.CONSUME2(Identifier)
    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME3(Identifier)
    })
  })

  private media = this.RULE('media', () => {
    this.CONSUME(Media)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.SUBRULE(this.property)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.area)
          },
        },
      ])
    })

    this.CONSUME(End)
  })

  private area = this.RULE('area', () => {
    this.CONSUME(Area)
    this.CONSUME(Identifier)
    this.MANY(() => {
      this.SUBRULE(this.property)
    })
    this.CONSUME(End)
  })

  private region = this.RULE('region', () => {
    this.CONSUME(Region)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.SUBRULE(this.property)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.region)
          },
        },
      ])
    })

    this.CONSUME(End)
  })

  private link = this.RULE('link', () => {
    this.SUBRULE(this.condition)

    this.CONSUME(Do)

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.SUBRULE(this.property)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.action)
          },
        },
      ])
    })

    this.CONSUME(End)
  })

  private condition = this.RULE('condition', () => {
    this.CONSUME(Condition)
    this.CONSUME1(Identifier)
    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME2(Identifier)
    })
  })

  private action = this.RULE('action', () => {
    this.CONSUME(Action)
    this.CONSUME1(Identifier)
    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME2(Identifier)
    })

    this.MANY(() => {
      this.SUBRULE(this.property)
    })

    this.CONSUME(End)
  })

  private context = this.RULE('context', () => {
    this.CONSUME(Context)
    this.CONSUME(Identifier)
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.port) },
        { ALT: () => this.SUBRULE(this.media) },
        { ALT: () => this.SUBRULE(this.link) },
        { ALT: () => this.SUBRULE(this.context) },
      ])
    })
    this.CONSUME(End)
  })

  private property = this.RULE('property', () => {
    this.CONSUME1(Identifier)
    this.CONSUME(Colon)
    this.OR([
      {
        ALT: () => {
          this.CONSUME2(Identifier)
        },
      },
      {
        ALT: () => {
          this.CONSUME(Value)
        },
      },
    ])
  })

  private macro = this.RULE('macro', () => {
    this.CONSUME(Macro)
    this.CONSUME1(Identifier)
    this.CONSUME(LParen)
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => this.CONSUME2(Identifier),
    })
    this.CONSUME(RParen)

    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.port) },
        { ALT: () => this.SUBRULE(this.media) },
        { ALT: () => this.SUBRULE(this.region) },
        { ALT: () => this.SUBRULE(this.context) },
        { ALT: () => this.SUBRULE(this.link) },
        { ALT: () => this.SUBRULE(this.macroCall) },
      ])
    })

    this.CONSUME(End)
  })

  private macroCall = this.RULE('macroCall', () => {
    this.CONSUME1(Identifier)
    this.CONSUME(LParen)

    this.MANY_SEP({
      SEP: Comma,
      DEF: () => this.CONSUME(Argument),
    })

    this.CONSUME(RParen)
  })
}

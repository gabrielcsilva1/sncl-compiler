import type {
  VisitorContextResponse,
  VisitorDescriptorResponse,
  VisitorLinkResponse,
  VisitorMacroCallResponse,
  VisitorMacroResponse,
  VisitorMediaResponse,
  VisitorPortResponse,
  VisitorRegionResponse,
} from './@types/visitor-responses'
import { IdAlreadyExistsError } from './errors/id-already-exists-error'
import { SnclError } from './errors/sncl-error'
import type { VisitorXConnectorResponse } from './utils/resolve'

export type HeadType = VisitorRegionResponse | VisitorDescriptorResponse | VisitorXConnectorResponse

export type BodyType = VisitorMediaResponse | VisitorPortResponse | VisitorLinkResponse | VisitorContextResponse

export class SymbolsTable {
  private fileName: string
  private head: Record<string, HeadType>
  private body: Record<string | number, BodyType>
  private macro: Record<string, VisitorMacroResponse>
  private macroCall: VisitorMacroCallResponse[]

  constructor(fileName: string) {
    this.fileName = fileName
    this.head = {}
    this.body = {}
    this.macro = {}
    this.macroCall = []
  }

  public getFileName() {
    return this.fileName
  }

  public setFileName(fileName: string) {
    this.fileName = fileName
  }

  public getHead() {
    return this.head
  }

  public addHead(element: HeadType) {
    const idAlreadyExists = element._type === 'region' && this.head[element.id]

    if (idAlreadyExists) {
      throw new IdAlreadyExistsError(element.id, this.fileName, element.line)
    }

    this.head[element.id] = element
  }

  public getBody() {
    return this.body
  }

  public addBody(element: BodyType) {
    // TODO: Validar se o id ja está sendo usado, se existir lançar um erro e tratar depois
    if (element._type === 'link') {
      const index = Object.keys(this.body).length

      this.body[index] = element
      return
    }

    if (this.body[element.id]) {
      throw new IdAlreadyExistsError(element.id, this.fileName, element.line)
    }

    this.body[element.id] = element
  }

  public getMacros() {
    return this.macro
  }

  public addMacro(macro: VisitorMacroResponse) {
    if (this.macro[macro.id]) {
      throw new SnclError(`[Macro already exists]: Macro "${macro.id}" already exists.`, this.fileName, macro.line)
    }

    this.macro[macro.id] = macro
  }

  public getMacroCall() {
    return this.macroCall
  }

  public addMacroCall(macroCall: VisitorMacroCallResponse) {
    this.macroCall.push(macroCall)
  }
}

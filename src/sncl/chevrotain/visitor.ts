import type { IToken } from 'chevrotain'
import type {
  ActionCstChildren,
  AreaCstChildren,
  ConditionCstChildren,
  ContextCstChildren,
  ISnclVisitor,
  LinkCstChildren,
  MacroCallCstChildren,
  MacroCstChildren,
  MediaCstChildren,
  PortCstChildren,
  PropertyCstChildren,
  PropertyCstNode,
  RegionCstChildren,
  StartCstChildren,
} from '../@types/visitor-nodes'
import type {
  VisitorActionResponse,
  VisitorAreaResponse,
  VisitorConditionResponse,
  VisitorContextResponse,
  VisitorLinkResponse,
  VisitorMacroCallResponse,
  VisitorMacroResponse,
  VisitorMediaResponse,
  VisitorPortResponse,
  VisitorPropertyResponse,
  VisitorRegionResponse,
} from '../@types/visitor-responses'
import { SymbolsTable } from '../symbols-table'
import { makeDescriptor, makeXConnector } from '../utils/resolve'
import { isControlButton, removeQuotes } from '../utils/utils'
import { SnclParser } from './parser'
import { SnclError } from '../errors/sncl-error'

const parserInstance = new SnclParser()

const BaseSnclVisitor = parserInstance.getBaseCstVisitorConstructor()

export class SnclVisitor extends BaseSnclVisitor implements ISnclVisitor {
  private symbolsTable: SymbolsTable
  private isInsideMacro: boolean

  constructor(fileName: string) {
    super()

    this.symbolsTable = new SymbolsTable(fileName)
    this.isInsideMacro = false

    this.validateVisitor()
  }

  public getSymbolsTable() {
    return this.symbolsTable
  }

  start(children: StartCstChildren) {
    children.region?.forEach(region => this.visit(region))

    for (const port of children.port || []) {
      this.visit(port)
    }

    for (const media of children.media || []) {
      this.visit(media)
    }

    for (const context of children.context || []) {
      this.visit(context)
    }

    for (const link of children.link || []) {
      this.visit(link)
    }

    this.isInsideMacro = true
    for (const macro of children.macro || []) {
      const element = this.visit(macro)
      this.symbolsTable.addMacro(element)
    }
    this.isInsideMacro = false

    for (const macroCall of children.macroCall || []) {
      const element = this.visit(macroCall)
      this.symbolsTable.addMacroCall(element)
    }
  }

  port(children: PortCstChildren) {
    const element: VisitorPortResponse = {
      _type: 'port',
      id: children.Identifier[0].image,
      line: Number(children.Identifier[0].startLine),
      component: children.Identifier[1].image,
    }

    if (children.Dot) {
      element.interface = children.Identifier[2].image
    }

    if (!this.isInsideMacro) {
      this.symbolsTable.addBody(element)
    }

    return element
  }

  media(children: MediaCstChildren) {
    const element: VisitorMediaResponse = {
      _type: 'media',
      id: children.Identifier[0].image,
      line: Number(children.Identifier[0].startLine),
      properties: {},
      children: [],
    }

    const properties = this.convertPropertiesToObject(children.property)

    const { rg, src, type, ...rest } = properties
    element.regionId = rg
    element.src = src
    element.properties = rest

    element.children = children.area?.map(area => this.visit(area)) || []

    if (!this.isInsideMacro) {
      this.symbolsTable.addBody(element)

      if (element.regionId !== undefined) {
        const descriptor = makeDescriptor({
          regionId: element.regionId,
          symbolsTable: this.symbolsTable,
        })

        element.descriptorId = descriptor.id
      }
    }

    return element
  }

  area(children: AreaCstChildren) {
    const element: VisitorAreaResponse = {
      _type: 'area',
      id: children.Identifier[0].image,
      properties: {},
    }

    element.properties = this.convertPropertiesToObject(children.property)

    return element
  }

  region(children: RegionCstChildren) {
    const element: VisitorRegionResponse = {
      _type: 'region',
      id: children.Identifier[0].image,
      line: Number(children.Identifier[0].startLine),
      children: [],
      properties: {},
    }

    element.children =
      children.region?.map(region => {
        const son = this.visit(region) as VisitorRegionResponse
        son.father = element
        return son
      }) || []

    element.properties = this.convertPropertiesToObject(children.property)

    if (!this.isInsideMacro) {
      this.symbolsTable.addHead(element)
    }

    return element
  }

  link(children: LinkCstChildren) {
    const element: VisitorLinkResponse = {
      _type: 'link',
      connectorId: '',
      conditions: [],
      actions: [],
      properties: this.convertPropertiesToObject(children.property),
    }

    children.condition.forEach(condition => {
      const son = this.visit(condition) as VisitorConditionResponse
      son.father = element
      element.conditions.push(son)
    })

    children.action?.forEach(action => {
      const son = this.visit(action) as VisitorActionResponse
      son.father = element
      element.actions.push(son)
    })

    const connector = makeXConnector({
      link: element,
      symbolsTable: this.symbolsTable,
    })

    element.connectorId = connector.id

    if (!this.isInsideMacro) {
      this.symbolsTable.addBody(element)
    }

    return element
  }

  condition(children: ConditionCstChildren) {
    const element: VisitorConditionResponse = {
      _type: 'condition',
      role: children.Condition[0].image,
      line: Number(children.Identifier[0].startLine),
      component: children.Identifier[0].image,
      properties: {},
      father: {} as VisitorLinkResponse,
    }

    if (children.Dot) {
      const iface = children.Identifier[1].image

      if (this.isInsideMacro === false && element.role === 'onSelection' && isControlButton(iface)) {
        element.properties._keyValue = iface
      } else {
        element.interface = iface
      }
    }

    return element
  }

  action(children: ActionCstChildren) {
    const element: VisitorActionResponse = {
      _type: 'action',
      role: children.Action[0].image,
      line: Number(children.Identifier[0].startLine),
      component: children.Identifier[0].image,
      properties: {},
      father: {} as VisitorLinkResponse,
    }

    if (children.Dot) {
      element.interface = children.Identifier[1].image
    }

    element.properties = this.convertPropertiesToObject(children.property)

    return element
  }

  context(children: ContextCstChildren): VisitorContextResponse {
    const element: VisitorContextResponse = {
      _type: 'context',
      id: children.Identifier[0].image,
      line: Number(children.Identifier[0].startLine),
      children: [],
    }

    children.port?.forEach(port => {
      const son = this.visit(port) as VisitorPortResponse
      son.father = element
      element.children.push(son)
    })

    children.media?.forEach(media => {
      const son = this.visit(media) as VisitorMediaResponse
      son.father = element
      element.children.push(son)
    })

    children.link?.forEach(link => {
      const son = this.visit(link) as VisitorLinkResponse
      son.father = element
      element.children.push(son)
    })

    children.context?.forEach(context => {
      const son = this.visit(context) as VisitorContextResponse
      son.father = element
      element.children.push(son)
    })

    if (!this.isInsideMacro) {
      this.symbolsTable.addBody(element)
    }

    return element
  }

  macro(children: MacroCstChildren): VisitorMacroResponse {
    const element: VisitorMacroResponse = {
      _type: 'macro',
      id: children.Identifier[0].image,
      line: Number(children.Identifier[0].startColumn),
      parameters: new Set(),
      children: [],
    }

    const parametersTokens: IToken[] = children.Identifier.slice(1)

    parametersTokens.forEach(paramToken => {
      const param = paramToken.image

      if (element.parameters.has(param)) {
        throw new SnclError(
          `Duplicate Identifier ${param} in macro definition`,
          this.symbolsTable.getFileName(),
          paramToken.startLine,
        )
      }

      element.parameters.add(param)
    })

    const regions = children.region?.map(region => this.visit(region)) || []
    const ports = children.port?.map(port => this.visit(port)) || []
    const medias = children.media?.map(media => this.visit(media)) || []
    const contexts = children.context?.map(context => this.visit(context)) || []
    const links = children.link?.map(link => this.visit(link)) || []

    const macroCalls =
      children.macroCall?.map(macroCall => {
        const son = this.visit(macroCall)
        son.father = element
        return son
      }) || []

    element.children = [...regions, ...ports, ...medias, ...contexts, ...links, ...macroCalls]

    return element
  }

  macroCall(children: MacroCallCstChildren): VisitorMacroCallResponse {
    const element: VisitorMacroCallResponse = {
      _type: 'macro-call',
      macroId: children.Identifier[0].image,
      line: Number(children.Identifier[0].startLine),
      arguments: [],
    }

    // TODO: se não for filho de macro fazer a validação para parâmetros do tipo Identifier

    children.Argument?.forEach(value => {
      element.arguments.push(value.image)
    })

    return element
  }

  property(children: PropertyCstChildren) {
    const name = children.Identifier[0].image
    const value = children.Value ? children.Value[0].image : children.Identifier[1].image

    return {
      name,
      value,
    }
  }

  private convertPropertiesToObject(properties?: PropertyCstNode[]): Record<string, string> {
    if (!properties) {
      return {}
    }

    const propertiesArray = properties.map(property => this.visit(property) as VisitorPropertyResponse)

    if (!this.isInsideMacro) {
      // Remove quotes
      for (const property of propertiesArray) {
        property.value = removeQuotes(property.value)
      }
    }

    const response: Record<string, string> = {}

    for (const property of propertiesArray) {
      const { name, value } = property
      response[name] = value
    }

    return response
  }
}

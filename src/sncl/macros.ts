import type {
  VisitorActionResponse,
  VisitorAreaResponse,
  VisitorConditionResponse,
  VisitorContextResponse,
  VisitorLinkResponse,
  VisitorMacroCallResponse,
  VisitorMediaResponse,
  VisitorPortResponse,
  VisitorRegionResponse,
} from './@types/visitor-responses'
import { MacroIsNotDeclaredError } from './errors/macro-is-not-declared-error'
import { SnclError } from './errors/sncl-error'
import type { BodyType, SymbolsTable } from './symbols-table'
import { makeDescriptor } from './utils/resolve'
import { isControlButton, isStringLiteral, removeQuotes } from './utils/utils'

function valid(value: string, stack: MacroStack) {
  if (stack.parameters[value] !== undefined) {
    return stack.parameters[value]
  }

  return removeQuotes(value)
}

function resolvePort(port: VisitorPortResponse, stack: MacroStack, symbolsTable: SymbolsTable) {
  const element: VisitorPortResponse = {
    ...port,
    id: valid(port.id, stack),
    component: valid(port.component, stack),
  }

  if (port.interface) {
    element.interface = valid(port.interface, stack)
  }

  symbolsTable.addBody(element)

  return element
}

function resolveArea(area: VisitorAreaResponse, stack: MacroStack) {
  const element: VisitorAreaResponse = {
    ...area,
    properties: { ...area.properties },
  }

  element.id = valid(element.id, stack)

  for (const [key, value] of Object.entries(element.properties)) {
    element.properties[key] = removeQuotes(valid(value, stack))
  }

  return element
}

function resolveMedia(media: VisitorMediaResponse, stack: MacroStack, symbolsTable: SymbolsTable) {
  const element: VisitorMediaResponse = {
    ...media,
    id: valid(media.id, stack),
    properties: { ...media.properties },
    children: [...media.children],
  }

  for (const [key, value] of Object.entries(element.properties)) {
    element.properties[key] = removeQuotes(valid(value, stack))
  }

  if (element.regionId) {
    element.regionId = valid(element.regionId, stack)

    const descriptor = makeDescriptor({
      regionId: element.regionId,
      symbolsTable,
    })

    element.descriptorId = descriptor.id
  }

  if (element.src) {
    element.src = valid(element.src, stack)
  }

  for (const [index, son] of element.children.entries()) {
    element.children[index] = resolveArea(son, stack)
  }

  symbolsTable.addBody(element)

  return element
}

function resolveRegion(region: VisitorRegionResponse, stack: MacroStack, symbolsTable: SymbolsTable) {
  const element: VisitorRegionResponse = {
    ...region,
    id: valid(region.id, stack),
    properties: { ...region.properties },
    children: [...region.children],
  }

  for (const [key, value] of Object.entries(element.properties)) {
    element.properties[key] = valid(value, stack)
  }

  for (const [index, son] of element.children.entries()) {
    element.children[index] = resolveRegion(son, stack, symbolsTable)
  }

  symbolsTable.addHead(element)

  return element
}

function resolveContext(context: VisitorContextResponse, stack: MacroStack, symbolsTable: SymbolsTable) {
  const element: VisitorContextResponse = {
    ...context,
    id: valid(context.id, stack),
    children: [...context.children],
  }

  for (const [index, son] of element.children.entries()) {
    element.children[index] = resolveBody(son, stack, symbolsTable)
  }

  symbolsTable.addBody(element)

  return element
}

function resolveBind(bind: VisitorConditionResponse | VisitorActionResponse, stack: MacroStack) {
  const element: VisitorConditionResponse | VisitorActionResponse = {
    ...bind,
    component: valid(bind.component, stack),
    properties: { ...bind.properties },
  }

  if (element.interface) {
    element.interface = valid(element.interface, stack)

    if (isControlButton(element.interface) && element.role === 'onSelection') {
      element.properties._keyValue = element.interface
      element.interface = undefined
    }
  }

  for (const [key, value] of Object.entries(element.properties)) {
    element.properties[key] = valid(value, stack)
  }

  return element
}

function resolveLink(link: VisitorLinkResponse, stack: MacroStack, symbolsTable: SymbolsTable) {
  const element: VisitorLinkResponse = {
    ...link,
    actions: [],
    conditions: [],
  }

  for (const condition of link.conditions) {
    const son = resolveBind(condition, stack) as VisitorConditionResponse
    son.father = element
    element.conditions.push(son)
  }

  for (const action of link.actions) {
    const son = resolveBind(action, stack) as VisitorActionResponse
    son.father = element
    element.actions.push(son)
  }

  for (const [key, value] of Object.entries(element.properties)) {
    element.properties[key] = valid(value, stack)
  }

  symbolsTable.addBody(element)

  return element
}

function resolveBody(element: BodyType, stack: MacroStack, symbolsTable: SymbolsTable) {
  if (element._type === 'media') {
    return resolveMedia(element, stack, symbolsTable)
  }
  if (element._type === 'port') {
    return resolvePort(element, stack, symbolsTable)
  }
  if (element._type === 'context') {
    return resolveContext(element, stack, symbolsTable)
  }

  return resolveLink(element, stack, symbolsTable)
}

function aux(macroCall: VisitorMacroCallResponse, stack: Array<MacroStack>, symbolsTable: SymbolsTable) {
  const macro = symbolsTable.getMacros()[macroCall.macroId]

  const parameters: Record<string, string> = {}
  let index = 0
  for (const param of macro.parameters) {
    parameters[param] = removeQuotes(macroCall.arguments[index])
    index += 1
  }

  stack.push({
    macroId: macroCall.macroId,
    parameters: parameters,
  })

  for (const son of macro.children) {
    if (son._type === 'macro-call') {
      call(son, stack, symbolsTable)
    } else if (son._type === 'port') {
      resolvePort(son, stack[stack.length - 1], symbolsTable)
    } else if (son._type === 'media') {
      resolveMedia(son, stack[stack.length - 1], symbolsTable)
    } else if (son._type === 'region') {
      resolveRegion(son, stack[stack.length - 1], symbolsTable)
    } else if (son._type === 'context') {
      resolveContext(son, stack[stack.length - 1], symbolsTable)
    } else if (son._type === 'link') {
      resolveLink(son, stack[stack.length - 1], symbolsTable)
    }
  }
}

type MacroStack = {
  macroId: string
  // paramIdentifier: paramValue
  parameters: Record<string, string>
}

function call(macroCall: VisitorMacroCallResponse, stack: Array<MacroStack>, symbolsTable: SymbolsTable) {
  const macro = symbolsTable.getMacros()[macroCall.macroId]
  const previousMacroCall = stack[stack.length - 1]

  if (macro === undefined) {
    throw new MacroIsNotDeclaredError('macroCall.macroId', symbolsTable.getFileName(), macroCall.line)
  }

  // Check if the call has the same number of arguments as specified in the called macro
  if (macro.parameters.size !== macroCall.arguments.length) {
    throw new SnclError('Wrong number of arguments', symbolsTable.getFileName(), macroCall.line)
  }

  for (const [index, argument] of macroCall.arguments.entries()) {
    if (isStringLiteral(argument)) {
      macroCall.arguments[index] = removeQuotes(argument)
    } else {
      const { father } = macroCall
      // Is identifier, defined, or not, in previous macro call
      if (father) {
        if (father.parameters.has(argument)) {
          macroCall.arguments[index] = previousMacroCall.parameters[argument]
        } else {
          throw new SnclError(
            `Argument ${argument} is not a parameter of macro`,
            symbolsTable.getFileName(),
            macroCall.line,
          )
        }
      } else {
        throw new SnclError(
          `Argument ${argument} is invalid. Did you mean "${argument}"`,
          symbolsTable.getFileName(),
          macroCall.line,
        )
      }
    }
  }

  aux(macroCall, stack, symbolsTable)
}

export function resolveMacro(symbolsTable: SymbolsTable) {
  for (const macroCall of symbolsTable.getMacroCall()) {
    const stack: Array<MacroStack> = []
    call(macroCall, stack, symbolsTable)
  }
}

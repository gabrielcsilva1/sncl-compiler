import type { GenericElement } from '../@types/core'
import type {
  VisitorActionResponse,
  VisitorConditionResponse,
  VisitorDescriptorResponse,
  VisitorLinkResponse,
} from '../@types/visitor-responses'
import type { SymbolsTable } from '../symbols-table'

type MakeDescriptorParams = {
  regionId: string
  symbolsTable: SymbolsTable
}

export function makeDescriptor({ regionId, symbolsTable }: MakeDescriptorParams) {
  const descriptor: VisitorDescriptorResponse = {
    _type: 'descriptor',
    id: `__desc__${regionId}`,
    regionId,
  }

  symbolsTable.addHead(descriptor)

  return descriptor
}

type MakeXConnectorParams = {
  link: VisitorLinkResponse
  symbolsTable: SymbolsTable
}

type XConnectorBind = {
  params: Set<string>
  count: number
}

export interface VisitorXConnectorResponse extends GenericElement<'xconnector'> {
  id: string
  conditions: Record<string, XConnectorBind> // Condition_name: {params: string, count: number}
  actions: Record<string, XConnectorBind> // Action_name: {params: string, count: number}
  properties: Set<string>
}

export function makeXConnector({ link, symbolsTable }: MakeXConnectorParams) {
  const connector: VisitorXConnectorResponse = {
    _type: 'xconnector',
    id: '',
    actions: {},
    conditions: {},
    properties: new Set(),
  }

  // Generate count and params
  connector.actions = makeXConnectorBind(link.actions)
  connector.conditions = makeXConnectorBind(link.conditions)

  // Adding action params/properties
  for (const action of Object.values(connector.actions)) {
    action.params.forEach((param) => connector.properties.add(param))
  }

  for (const property of Object.keys(link.properties)) {
    connector.properties.add(property)
  }

  // Build id
  let id = Object.keys(connector.conditions).join('_')

  for (const [actionRole, details] of Object.entries(connector.actions)) {
    id += `_${actionRole}`
    id += details.count > 1 ? 'N' : ''

    const params = Array.from(details.params)

    if (params.length > 0) {
      id += `_${params.join('_')}`
    }
  }

  connector.id = id

  symbolsTable.addHead(connector)

  return connector
}

function makeXConnectorBind(binds: VisitorActionResponse[] | VisitorConditionResponse[]) {
  const bindResult: Record<string, XConnectorBind> = {}

  for (const bind of binds) {
    if (bindResult[bind.role] === undefined) {
      bindResult[bind.role] = {
        params: new Set(),
        count: 1,
      }
    } else {
      bindResult[bind.role].count += 1
    }

    for (const param of Object.keys(bind.properties)) {
      bindResult[bind.role].params.add(param)
    }
  }

  return bindResult
}

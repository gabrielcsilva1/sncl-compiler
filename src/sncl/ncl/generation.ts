import type { SymbolsTable } from '../symbols-table'
import type {
  VisitorActionResponse,
  VisitorAreaResponse,
  VisitorConditionResponse,
  VisitorContextResponse,
  VisitorDescriptorResponse,
  VisitorLinkResponse,
  VisitorMediaResponse,
  VisitorPortResponse,
  VisitorRegionResponse,
} from '../@types/visitor-responses'
import type { VisitorXConnectorResponse } from '../utils/resolve'
import { validate } from './validator'

const generate = {
  descriptor(descriptor: VisitorDescriptorResponse, indent: string): string {
    return `${indent}<descriptor id="${descriptor.id}" region="${descriptor.regionId}" />`
  },

  region(region: VisitorRegionResponse, indent: string) {
    let result = `${indent}<region id="${region.id}"`

    for (const [key, value] of Object.entries(region.properties)) {
      result += ` ${key}="${value}"`
    }

    result += '>'

    for (const son of region.children) {
      result += generate.region(son, indent + '\t')
    }

    result += `${indent}</region>`

    return result
  },

  condition(connector: VisitorXConnectorResponse, indent: string): string {
    const { conditions } = connector
    let result = ''

    for (const [conditionName, details] of Object.entries(conditions)) {
      result += `${indent}<simpleCondition role="${conditionName}"`

      if (details.count > 1) {
        result += ' max="unbounded" qualifier="and'
      }

      if (conditionName === 'onSelection' && connector.properties.has('_keyValue')) {
        // And __keyvValue on properties
        result += ' key="$_keyValue"'
      }

      result += '>'

      result += `${indent}</simpleCondition>`
    }

    return result
  },
  action(connector: VisitorXConnectorResponse, indent: string) {
    const { actions } = connector
    let result = ''

    for (const [action, details] of Object.entries(actions)) {
      result += `${indent}<simpleAction role="${action}"`

      if (details.count > 1) {
        result += ' max="unbounded" qualifier="par"'
      }

      details.params.forEach(param => {
        result += ` ${param}="$${param}"`
      })

      result += '>'

      result += `${indent}</simpleAction>`
    }

    return result
  },

  xconnector(connector: VisitorXConnectorResponse, indent: string): string {
    let result = `${indent}<causalConnector id="${connector.id}">`

    const numberOfConditions = Object.keys(connector.conditions).length

    if (numberOfConditions > 1) {
      result += `${indent}\t<compoundCondition operator="and">`
      result += generate.condition(connector, indent + '\t\t')
      result += `${indent}\t</compoundCondition>`
    } else {
      result += generate.condition(connector, indent + '\t')
    }

    const numberOfActions = Object.keys(connector.actions).length

    if (numberOfActions > 1) {
      result += `${indent}\t<compoundAction operator="par">`
      result += generate.action(connector, indent + '\t\t')
      result += `${indent}\t</compoundAction>`
    } else {
      result += generate.action(connector, indent + '\t')
    }

    for (const property of connector.properties) {
      result += `${indent}\t<connectorParam name="${property}" />`
    }

    result += `${indent}</causalConnector>`

    return result
  },

  head(symbolsTree: SymbolsTable, indent: string) {
    let connectorBase = `${indent}<connectorBase>`
    let regionBase = `${indent}<regionBase>`
    let descriptorBase = `${indent}<descriptorBase>`

    for (const element of Object.values(symbolsTree.getHead())) {
      if (element._type === 'descriptor') {
        descriptorBase += generate.descriptor(element, indent + '\t')
      } else if (element._type === 'region' && !element.father) {
        regionBase += generate.region(element, indent + '\t')
      } else if (element._type === 'xconnector') {
        connectorBase += generate.xconnector(element, indent + '\t')
      }
    }

    connectorBase += `${indent}</connectorBase>`
    regionBase += `${indent}</regionBase>`
    descriptorBase += `${indent}</descriptorBase>`

    return connectorBase + regionBase + descriptorBase
  },

  port(port: VisitorPortResponse, indent: string, symbolsTable: SymbolsTable) {
    let result = `${indent}<port id="${port.id}" component="${port.component}" `

    if (port.interface) {
      result += `interface="${port.interface}" `
    }

    result += '/>'

    return result
  },

  area(area: VisitorAreaResponse, indent: string) {
    let result = `${indent}<area id="${area.id}" `

    for (const [key, value] of Object.entries(area.properties)) {
      result += `${key}="${value}" `
    }

    result += '/>'

    return result
  },

  media(media: VisitorMediaResponse, indent: string, symbolsTable: SymbolsTable) {
    let result = `${indent}<media id="${media.id}"`

    // TODO verify if regionId exists
    validate.media(media, symbolsTable)

    if (media.src) {
      result += ` src="${media.src}"`
    }

    if (media.descriptorId) {
      result += ` descriptor="${media.descriptorId}"`
    }

    result += '>'

    for (const [key, value] of Object.entries(media.properties)) {
      result += `${indent}\t<property name="${key}" value="${value}" />`
    }

    for (const area of media.children) {
      result += generate.area(area, indent + '\t')
    }

    result += `${indent}</media>`

    return result
  },

  bind(element: VisitorConditionResponse | VisitorActionResponse, indent: string, symbolsTable: SymbolsTable) {
    validate.bind(element, symbolsTable)

    let result = `${indent}<bind role="${element.role}" component="${element.component}"`

    if (element.interface) {
      result += ` interface="${element.interface}"`
    }

    result += '>'

    for (const [key, value] of Object.entries(element.properties)) {
      result += `${indent}\t<bindParam name="${key}" value="${value}" />`
    }

    result += `${indent}<bind/>`

    return result
  },

  link(link: VisitorLinkResponse, indent: string, symbolsTable: SymbolsTable) {
    let result = `${indent}<link xconnector="${link.connectorId}">`

    for (const condition of link.conditions) {
      result += generate.bind(condition, indent + '\t', symbolsTable)
    }

    for (const action of link.actions) {
      result += generate.bind(action, indent + '\t', symbolsTable)
    }

    for (const [key, value] of Object.entries(link.properties)) {
      result += `${indent}\t<linkParam name="${key}" value="${value}" />`
    }

    result += `${indent}</link>`

    return result
  },

  context(context: VisitorContextResponse, indent: string, symbolsTable: SymbolsTable): string {
    let result = `${indent}<context id="${context.id}">`

    for (const son of context.children) {
      if (son._type === 'port') {
        result += generate.port(son, indent + '\t', symbolsTable)
      } else if (son._type === 'media') {
        result += generate.media(son, indent + '\t', symbolsTable)
      } else if (son._type === 'link') {
        result += generate.link(son, indent + '\t', symbolsTable)
      } else {
        result += generate.context(son, indent + '\t', symbolsTable)
      }
    }

    result += `${indent}</context>`

    return result
  },

  body(symbolsTree: SymbolsTable, indent: string, symbolsTable: SymbolsTable) {
    let result = ''
    for (const element of Object.values(symbolsTree.getBody())) {
      if (element.father) {
        continue
      }

      if (element._type === 'media') {
        result += generate.media(element, indent, symbolsTable)
      } else if (element._type === 'port') {
        result += generate.port(element, indent, symbolsTable)
      } else if (element._type === 'link') {
        result += generate.link(element, indent, symbolsTable)
      } else if (element._type === 'context') {
        result += generate.context(element, indent, symbolsTable)
      }
    }

    return result
  },
}

export function generateNCL(symbolsTree: SymbolsTable) {
  const indent = '\n\t'
  let result = '<?xml version="1.0" encoding="ISO-8859-1"?>\n'
  result += '<ncl id="main" xmlns="http://www.ncl.org.br/NCL3.0/EDTVProfile">'

  result += `${indent}<head>`
  result += generate.head(symbolsTree, indent + '\t')
  result += `${indent}</head>`

  result += `${indent}<body>`
  result += generate.body(symbolsTree, indent + '\t', symbolsTree)
  result += `${indent}</body>\n`

  result += '</ncl>'

  return result
}

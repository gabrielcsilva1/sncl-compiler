import type {
  VisitorActionResponse,
  VisitorConditionResponse,
  VisitorMediaResponse,
  VisitorPortResponse,
} from '../@types/visitor-responses'
import { SnclError } from '../errors/sncl-error'
import type { BodyType, SymbolsTable } from '../symbols-table'

export const validate = {
  port(port: VisitorPortResponse, symbolsTable: SymbolsTable) {
    let component: BodyType | undefined = symbolsTable.getBody()[port.component]

    if (port.father) {
      const father = port.father

      component = father.children.find(son => {
        if (son._type === 'link') {
          return false
        }

        return port.component === son.id
      })
    }

    if (component === undefined) {
      throw new SnclError(
        `Component with id "${port.component}" does not exits in the same context.`,
        symbolsTable.getFileName(),
        port.line,
      )
    }
  },
  bind(bind: VisitorConditionResponse | VisitorActionResponse, symbolsTable: SymbolsTable) {
    let component: BodyType | undefined = symbolsTable.getBody()[bind.component]
    const link = bind.father

    if (link.father) {
      const father = link.father

      component = father.children.find(son => {
        if (son._type === 'link') {
          return false
        }

        return bind.component === son.id
      })
    }

    if (component === undefined) {
      throw new SnclError(
        `Component with id "${bind.component}" does not exits in the same context.`,
        symbolsTable.getFileName(),
        bind.line,
      )
    }
  },

  media(media: VisitorMediaResponse, symbolsTable: SymbolsTable) {
    if (media.regionId === undefined) {
      return
    }

    if (symbolsTable.getHead()[media.regionId] === undefined) {
      throw new SnclError(`Region with id "${media.regionId}" does not exits.`, symbolsTable.getFileName(), media.line)
    }
  },
}

/**
 * - [] O componente referido por uma porta com ou sem interface
 * - [] O componente referido por um ação ou condição com ou sem interface
 * - [] A região existe
 * - []
 */

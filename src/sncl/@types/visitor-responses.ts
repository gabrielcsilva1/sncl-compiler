import type { GenericElement } from './core'

export interface VisitorPortResponse extends GenericElement<'port'> {
  id: string
  line: number
  component: string
  interface?: string
  father?: VisitorContextResponse
}

export interface VisitorMediaResponse extends GenericElement<'media'> {
  id: string
  line: number
  regionId?: string
  descriptorId?: string
  src?: string
  children: VisitorAreaResponse[]
  properties: Record<string, string>
  father?: VisitorContextResponse
}

export interface VisitorAreaResponse extends GenericElement<'area'> {
  id: string
  properties: Record<string, string>
}

export interface VisitorRegionResponse extends GenericElement<'region'> {
  id: string
  line: number
  properties: Record<string, string>
  children: VisitorRegionResponse[]
  father?: VisitorRegionResponse
}

export interface VisitorContextResponse extends GenericElement<'context'> {
  id: string
  line: number
  children: Array<VisitorPortResponse | VisitorMediaResponse | VisitorLinkResponse | VisitorContextResponse>
  father?: VisitorContextResponse
}

export interface VisitorMacroResponse extends GenericElement<'macro'> {
  id: string
  line: number
  parameters: Set<string>
  children: Array<
    | VisitorPortResponse
    | VisitorMediaResponse
    | VisitorContextResponse
    | VisitorLinkResponse
    | VisitorMacroCallResponse
    | VisitorRegionResponse
  >
}

export interface VisitorMacroCallResponse extends GenericElement<'macro-call'> {
  line: number
  macroId: string
  arguments: Array<string>
  father?: VisitorMacroResponse
}

/****************************************
 *                 LINK                 *
 ****************************************/
export interface VisitorLinkResponse extends GenericElement<'link'> {
  conditions: VisitorConditionResponse[]
  connectorId: string
  actions: VisitorActionResponse[]
  properties: Record<string, string>
  father?: VisitorContextResponse
}

export interface VisitorConditionResponse {
  _type: 'condition'
  role: string
  line: number
  component: string
  interface?: string
  properties: Record<string, string>
  father: VisitorLinkResponse
}

export interface VisitorActionResponse {
  _type: 'action'
  role: string
  line: number
  component: string
  interface?: string
  properties: Record<string, string>
  father: VisitorLinkResponse
}

export interface VisitorPropertyResponse {
  name: string
  value: string
}

export interface VisitorDescriptorResponse extends GenericElement<'descriptor'> {
  id: string
  regionId: string
}

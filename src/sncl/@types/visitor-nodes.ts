import type { CstNode, ICstVisitor, IToken } from 'chevrotain'
import type {
  VisitorMediaResponse,
  VisitorPortResponse,
  VisitorPropertyResponse,
  VisitorRegionResponse,
  VisitorAreaResponse,
  VisitorActionResponse,
  VisitorLinkResponse,
  VisitorConditionResponse,
  VisitorContextResponse,
  VisitorMacroResponse,
  VisitorMacroCallResponse,
} from './visitor-responses'

// https://github.com/Chevrotain/chevrotain/blob/master/examples/implementation_languages/typescript/json_cst.d.ts

// Every CstNode has a name and a children
// Every Children can have a IToken[] (when the parser use this.CONSUME()) or another Node[] (when the parser use this.SUBRULE())

export type StartCstNode = CstNode & {
  name: 'start'
  children: StartCstChildren
}

export type StartCstChildren = {
  port?: PortCstNode[]
  media?: MediaCstNode[]
  region?: RegionCstNode[]
  link?: LinkCstNode[]
  context?: ContextCstNode[]
  macro?: MacroCstNode[]
  macroCall?: MacroCallCstNode[]
}

export type PortCstNode = CstNode & {
  name: 'port'
  children: PortCstChildren
}

export type PortCstChildren = {
  Identifier: IToken[]
  Dot?: IToken[]
}

export type MediaCstNode = CstNode & {
  name: 'media'
  children: MediaCstChildren
}

export type MediaCstChildren = {
  Identifier: IToken[]
  property?: PropertyCstNode[]
  area?: AreaCstNode[]
}

export type AreaCstNode = CstNode & {
  name: 'area'
  children: AreaCstChildren
}

export type AreaCstChildren = {
  Identifier: IToken[]
  property?: PropertyCstNode[]
}

export type RegionCstNode = CstNode & {
  name: 'region'
  children: RegionCstChildren
}

export type RegionCstChildren = {
  Identifier: IToken[]
  property?: PropertyCstNode[]
  region?: RegionCstNode[]
}

export type LinkCstNode = {
  name: 'link'
  children: LinkCstChildren
}

export type LinkCstChildren = {
  condition: ConditionCstNode[]
  action?: ActionCstNode[]
  property?: PropertyCstNode[]
}

export type ConditionCstNode = {
  name: 'condition'
  children: ConditionCstChildren
}

export type ConditionCstChildren = {
  Condition: IToken[]
  Identifier: IToken[]
  Dot?: IToken[]
}

export type ActionCstNode = {
  name: 'action'
  children: ActionCstChildren
}

export type ActionCstChildren = {
  Action: IToken[]
  Identifier: IToken[]
  Dot?: IToken[]
  property?: PropertyCstNode[]
}

export type ContextCstNode = CstNode & {
  name: 'context'
  children: ContextCstChildren
}

export type ContextCstChildren = {
  Identifier: IToken[]
  port?: PortCstNode[]
  media?: MediaCstNode[]
  link?: LinkCstNode[]
  context?: ContextCstNode[]
}

export type MacroCstNode = CstNode & {
  name: 'property'
  children: MacroCstChildren
}

export type MacroCstChildren = {
  Identifier: IToken[]
  region?: RegionCstNode[]
  port?: PortCstNode[]
  media?: MediaCstNode[]
  context?: ContextCstNode[]
  link?: LinkCstNode[]
  macroCall?: MacroCallCstNode[]
}

export type MacroCallCstNode = CstNode & {
  name: 'macro-call'
  children: MacroCallCstChildren
}

export type MacroCallCstChildren = {
  Identifier: IToken[]
  Argument?: IToken[]
}

export type PropertyCstNode = CstNode & {
  name: 'property'
  children: PropertyCstChildren
}

export type PropertyCstChildren = {
  Identifier: IToken[]
  Value?: IToken[]
}

export interface ISnclVisitor extends ICstVisitor<void, unknown> {
  start(children: StartCstChildren): void
  port(children: PortCstChildren): VisitorPortResponse
  media(children: MediaCstChildren): VisitorMediaResponse
  area(children: AreaCstChildren): VisitorAreaResponse
  region(children: RegionCstChildren): VisitorRegionResponse
  link(children: LinkCstChildren): VisitorLinkResponse
  condition(children: ConditionCstChildren): VisitorConditionResponse
  action(children: ActionCstChildren): VisitorActionResponse
  context(children: ContextCstChildren): VisitorContextResponse
  macro(children: MacroCstChildren): VisitorMacroResponse
  macroCall(children: MacroCallCstChildren): VisitorMacroCallResponse
  property(children: PropertyCstChildren): VisitorPropertyResponse
}

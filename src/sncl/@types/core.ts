export const SnclTypesEnum = {
  PORT: 'port',
  MEDIA: 'media',
  AREA: 'area',
  REGION: 'region',
  DESCRIPTOR: 'descriptor',
  CONTEXT: 'context',
  LINK: 'link',
  XCOONECTOR: 'xconnector',
  MACRO: 'macro',
  MACRO_CALL: 'macro-call',
} as const

/**
 * Represents the values ​​of SnclTypesEnum
 *
 * Example: if SnclTypesEnum.MEDIA: 'media', then SnclTypesValues include 'media'
 */
export type SnclTypesValues = (typeof SnclTypesEnum)[keyof typeof SnclTypesEnum]

export interface GenericElement<T extends SnclTypesValues> {
  _type: T
}

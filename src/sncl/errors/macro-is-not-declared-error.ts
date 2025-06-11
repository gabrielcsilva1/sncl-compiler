import { SnclError } from './sncl-error'

export class MacroIsNotDeclaredError extends SnclError {
  constructor(macroId: string, fileName: string, line = 0) {
    const message = `[Macro is not declared]: Macro ${macroId}() is not declared`
    super(message, fileName, line)
  }
}

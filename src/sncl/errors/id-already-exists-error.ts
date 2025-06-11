import { SnclError } from './sncl-error'

export class IdAlreadyExistsError extends SnclError {
  constructor(id: string, fileName: string, line = 0) {
    super(`[Identifier error]: Element with id "${id}" already exists`, fileName, line)
  }
}

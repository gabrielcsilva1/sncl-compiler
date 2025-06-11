export class SnclError extends Error {
  constructor(message: string, file: string, line = 0) {
    super(`${file}:${line}:${message}`)
  }
}

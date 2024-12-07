import * as os from 'node:os'
import type { TerminalManager } from '../terminal/TerminalManager'
import { LinuxTerminalManager } from '../terminal/LinuxTerminalManager'
import { WindowsTerminalManager } from '../terminal/WindowsTerminalManager'

export function makeTerminalManager(): TerminalManager {
  if (os.platform() === 'win32') {
    return WindowsTerminalManager.create()
  }
  return LinuxTerminalManager.create()
}

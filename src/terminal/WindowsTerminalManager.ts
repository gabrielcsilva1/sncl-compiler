import * as vscode from 'vscode'
import { TerminalManager } from './TerminalManager'

export class WindowsTerminalManager extends TerminalManager {
  protected makeTerminal(): vscode.Terminal {
    const terminal = vscode.window.createTerminal({
      name: '(sNCL Compiler)',
      shellPath: 'wsl.exe',
    })

    return terminal
  }

  executeSNCLCommand(filePath: string): void {
    const formattedFilePath = this.formatToWslFilePath(filePath)

    if (!this.terminal) {
      this.terminal = this.makeTerminal()
    }

    this.terminal.show()

    this.terminal.sendText(`sncl ${formattedFilePath}`)
  }

  private formatToWslFilePath(filePath: string): string {
    const wslFilePath = filePath.replace(/^([A-Za-z]):/, '/mnt/$1').replace(/\\/g, '/')

    return wslFilePath
  }

  static create(): TerminalManager {
    return new WindowsTerminalManager()
  }
}

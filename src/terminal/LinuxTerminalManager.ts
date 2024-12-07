import * as vscode from 'vscode'
import { TerminalManager } from './TerminalManager'

export class LinuxTerminalManager extends TerminalManager {
  makeTerminal(): vscode.Terminal {
    const terminal = vscode.window.createTerminal({ name: '(sNCL Compiler)' })

    return terminal
  }

  executeSNCLCommand(filePath: string): void {
    if (!this.terminal) {
      this.terminal = this.makeTerminal()
    }

    this.terminal.show()

    this.terminal.sendText(`sncl ${filePath}`)
  }

  public static create(): TerminalManager {
    return new LinuxTerminalManager()
  }
}

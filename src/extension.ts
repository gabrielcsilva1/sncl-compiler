import * as vscode from 'vscode'
import { makeTerminalManager } from './factories/makeTerminalManager'

export function activate(context: vscode.ExtensionContext) {
  const terminalManager = makeTerminalManager()

  const disposable = vscode.commands.registerCommand('sncl-compiler.compile', async () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage('Nenhum editor de texto ativo.')
      return
    }

    let filePath = editor.document.fileName

    if (!filePath.endsWith('.sncl')) {
      vscode.window.showErrorMessage('O arquivo atual não possui a extensão .sncl.')
      return
    }

    terminalManager.executeSNCLCommand(filePath)
  })

  const didCloseTerminal = vscode.window.onDidCloseTerminal((closedTerminal) => {
    terminalManager.handleTerminalClose(closedTerminal)
  })

  context.subscriptions.push(disposable)
  context.subscriptions.push(didCloseTerminal)
  context.subscriptions.push(terminalManager)
}

export function deactivate() {}

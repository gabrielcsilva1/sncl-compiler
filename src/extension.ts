import * as vscode from 'vscode'
import { beginParse } from './sncl'
import { SnclError } from './sncl/errors/sncl-error'

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('sNCL')

  const disposable = vscode.commands.registerCommand('sncl-compiler.compile', async () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage('Nenhum editor de texto ativo.')
      return
    }

    const filePath = editor.document.fileName

    if (!filePath.endsWith('.sncl')) {
      vscode.window.showErrorMessage('O arquivo atual não possui a extensão .sncl.')
      return
    }
    try {
      await beginParse(filePath)
      vscode.window.showInformationMessage('Compilation completed!')
    } catch (error) {
      if (error instanceof SnclError) {
        outputChannel.clear()
        outputChannel.show(true)
        outputChannel.appendLine(error.message)
        vscode.window.showErrorMessage(error.message)
      } else {
        vscode.window.showErrorMessage('An unexpected error occurred')
      }
    }
  })

  context.subscriptions.push(disposable)
  context.subscriptions.push(outputChannel)
}

export function deactivate() {}

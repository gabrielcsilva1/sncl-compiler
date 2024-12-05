import * as vscode from 'vscode'
import * as os from 'node:os'

function formatToWslFilePath(filePath: string): string {
  return filePath.replace(/^([A-Za-z]):/, '/mnt/$1').replace(/\\/g, '/')
}

function createTerminal(): vscode.Terminal {
  if (os.platform() === 'win32') {
    return vscode.window.createTerminal({
      name: 'WSL (SNCL Compiler)',
      shellPath: 'wsl.exe',
    })
  }

  return vscode.window.createTerminal({ name: 'SNCL Compiler' })
}

let existingTerminal: vscode.Terminal | null = null

export function activate(context: vscode.ExtensionContext) {
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

    if (os.platform() === 'win32') {
      filePath = formatToWslFilePath(filePath)
    }

    if (!existingTerminal) {
      existingTerminal = createTerminal()
    }

    existingTerminal.show()
    existingTerminal.sendText(`sncl ${filePath}`)
  })

  const didCloseTerminal = vscode.window.onDidCloseTerminal((closedTerminal) => {
    if (closedTerminal === existingTerminal) {
      existingTerminal = null
    }
  })

  context.subscriptions.push(disposable)
  context.subscriptions.push(didCloseTerminal)
}

export function deactivate() {
  if (existingTerminal) {
    existingTerminal.dispose()
    existingTerminal = null
  }
}

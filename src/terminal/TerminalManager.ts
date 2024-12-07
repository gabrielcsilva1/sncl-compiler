import { type Terminal, window } from 'vscode'

export abstract class TerminalManager {
  protected terminal: Terminal | null

  protected constructor() {
    this.terminal = null
  }

  /**
   * Clears the terminal instance if it has been closed
   *
   * @param {Terminal} closedTerminal - The terminal that was closed
   *
   * @remarks Used during vscode.window.onDidCloseTerminal event
   */
  public handleTerminalClose(closedTerminal: Terminal) {
    if (closedTerminal === this.terminal) {
      this.terminal = null
    }
  }

  /**
   * Creates and configures a terminal to run commands
   *
   * @returns {Terminal} configured terminal instance.
   */
  protected abstract makeTerminal(): Terminal

  /**
   * Run the scnl command in the terminal
   *
   * @param {string} filePath - The full path of the file
   */
  public abstract executeSNCLCommand(filePath: string): void

  /**
   * Frees the resources used by the terminal and removes the reference
   * @remarks Used when the extension is disabled.
   */
  dispose(): void {
    if (this.terminal) {
      this.terminal.dispose()
      this.terminal = null
    }
  }
}

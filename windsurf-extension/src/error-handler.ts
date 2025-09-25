import * as vscode from 'vscode';

export interface ErrorInfo {
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: Date;
  source: 'ide' | 'extension' | 'terminal' | 'git';
}

export class ErrorHandler {
  private errorCallback?: (error: ErrorInfo) => void;
  private isMonitoring: boolean = false;
  private disposables: vscode.Disposable[] = [];

  startMonitoring(callback: (error: ErrorInfo) => void): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    this.errorCallback = callback;
    this.isMonitoring = true;

    // Monitor workspace diagnostics (TypeScript, ESLint, etc.)
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics(this.handleDiagnosticsChange.bind(this))
    );

    // Monitor file system errors
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(this.handleDocumentChange.bind(this))
    );

    // Monitor extension host errors
    this.setupGlobalErrorHandling();

    console.log('🔍 Error monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.errorCallback = undefined;

    // Dispose all listeners
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];

    console.log('🛑 Error monitoring stopped');
  }

  private handleDiagnosticsChange(event: vscode.DiagnosticChangeEvent): void {
    if (!this.errorCallback || !this.isMonitoring) return;

    event.uris.forEach(uri => {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      
      diagnostics.forEach(diagnostic => {
        if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
          const error: ErrorInfo = {
            message: diagnostic.message,
            file: uri.fsPath,
            line: diagnostic.range.start.line,
            column: diagnostic.range.start.character,
            timestamp: new Date(),
            source: 'ide'
          };

          if (this.errorCallback) {
            this.errorCallback(error);
          }
        }
      });
    });
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Monitor for potential runtime errors in code changes
    // This is a simplified implementation - in practice, you'd want more sophisticated analysis
    
    if (!this.errorCallback || !this.isMonitoring) return;

    event.contentChanges.forEach(change => {
      const text = change.text;
      
      // Look for common error patterns
      const errorPatterns = [
        /console\.error\(['"`]([^'"`]+)['"`]\)/g,
        /throw new Error\(['"`]([^'"`]+)['"`]\)/g,
        /Error:\s*([^\n]+)/g
      ];

      errorPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const error: ErrorInfo = {
            message: match[1] || match[0],
            file: event.document.uri.fsPath,
            line: event.document.positionAt(change.rangeOffset).line,
            column: event.document.positionAt(change.rangeOffset).character,
            timestamp: new Date(),
            source: 'ide'
          };

          if (this.errorCallback) {
            this.errorCallback(error);
          }
        }
      });
    });
  }

  private setupGlobalErrorHandling(): void {
    // Capture unhandled promise rejections and errors in the extension context
    const originalConsoleError = console.error;
    
    console.error = (...args: any[]) => {
      if (this.errorCallback && this.isMonitoring) {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        const error: ErrorInfo = {
          message,
          timestamp: new Date(),
          source: 'extension'
        };

        this.errorCallback(error);
      }

      // Call original console.error
      originalConsoleError.apply(console, args);
    };
  }

  captureError(error: Error | string, source: ErrorInfo['source'] = 'extension', context?: any): void {
    if (!this.errorCallback || !this.isMonitoring) return;

    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date(),
      source
    };

    // Try to extract file/line info from stack trace
    if (errorInfo.stack) {
      const stackMatch = errorInfo.stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
      if (stackMatch) {
        errorInfo.file = stackMatch[1];
        errorInfo.line = parseInt(stackMatch[2]) - 1; // VS Code uses 0-based line numbers
        errorInfo.column = parseInt(stackMatch[3]) - 1;
      }
    }

    this.errorCallback(errorInfo);
  }

  async analyzeWorkspaceErrors(): Promise<ErrorInfo[]> {
    const errors: ErrorInfo[] = [];

    // Get all diagnostics from the workspace
    const diagnostics = vscode.languages.getDiagnostics();

    diagnostics.forEach(([uri, diagnosticArray]) => {
      diagnosticArray.forEach(diagnostic => {
        if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
          errors.push({
            message: diagnostic.message,
            file: uri.fsPath,
            line: diagnostic.range.start.line,
            column: diagnostic.range.start.character,
            timestamp: new Date(),
            source: 'ide'
          });
        }
      });
    });

    return errors;
  }

  async getErrorSummary(): Promise<{
    totalErrors: number;
    errorsByFile: Record<string, number>;
    errorsBySource: Record<string, number>;
    recentErrors: ErrorInfo[];
  }> {
    const errors = await this.analyzeWorkspaceErrors();

    const errorsByFile: Record<string, number> = {};
    const errorsBySource: Record<string, number> = {};

    errors.forEach(error => {
      if (error.file) {
        const fileName = error.file.split('/').pop() || error.file;
        errorsByFile[fileName] = (errorsByFile[fileName] || 0) + 1;
      }
      errorsBySource[error.source] = (errorsBySource[error.source] || 0) + 1;
    });

    // Get recent errors (last 10)
    const recentErrors = errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalErrors: errors.length,
      errorsByFile,
      errorsBySource,
      recentErrors
    };
  }

  async showErrorInEditor(error: ErrorInfo): Promise<void> {
    if (!error.file || error.line === undefined) return;

    try {
      const document = await vscode.workspace.openTextDocument(error.file);
      const editor = await vscode.window.showTextDocument(document);
      
      const position = new vscode.Position(error.line, error.column || 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position));

      // Highlight the error line
      const decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid red'
      });

      editor.setDecorations(decoration, [new vscode.Range(position, position)]);

      // Remove decoration after 3 seconds
      setTimeout(() => {
        decoration.dispose();
      }, 3000);

    } catch (err) {
      console.error('Failed to show error in editor:', err);
    }
  }

  async createErrorReport(): Promise<string> {
    const summary = await this.getErrorSummary();
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    const report = `
# Error Report - ${new Date().toISOString()}

## Workspace
- **Path**: ${workspaceFolder?.uri.fsPath || 'Unknown'}
- **Name**: ${workspaceFolder?.name || 'Unknown'}

## Summary
- **Total Errors**: ${summary.totalErrors}
- **Files with Errors**: ${Object.keys(summary.errorsByFile).length}

## Errors by Source
${Object.entries(summary.errorsBySource)
  .map(([source, count]) => `- **${source}**: ${count}`)
  .join('\n')}

## Errors by File
${Object.entries(summary.errorsByFile)
  .sort(([,a], [,b]) => b - a)
  .map(([file, count]) => `- **${file}**: ${count} errors`)
  .join('\n')}

## Recent Errors
${summary.recentErrors.map((error, index) => `
### ${index + 1}. ${error.message}
- **File**: ${error.file ? error.file.split('/').pop() : 'Unknown'}
- **Line**: ${error.line !== undefined ? error.line + 1 : 'Unknown'}
- **Source**: ${error.source}
- **Time**: ${error.timestamp.toLocaleString()}
${error.stack ? `- **Stack**: \`${error.stack.split('\n')[0]}\`` : ''}
`).join('\n')}
`;

    return report.trim();
  }

  async exportErrorReport(): Promise<void> {
    try {
      const report = await this.createErrorReport();
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      const fileName = `error-report-${new Date().toISOString().split('T')[0]}.md`;
      const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName);
      
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(report, 'utf8'));
      
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);
      
      vscode.window.showInformationMessage(`Error report saved to ${fileName}`);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export error report: ${error}`);
    }
  }
}

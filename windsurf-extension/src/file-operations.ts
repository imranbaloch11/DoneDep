import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface FileOperationsInterface {
  createFile(filePath: string, content: string): Promise<void>;
  updateFile(filePath: string, content: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  createDirectory(dirPath: string): Promise<void>;
  watchFileChanges(filePath: string, callback: (event: vscode.FileChangeEvent) => void): vscode.Disposable;
}

export class FileOperations implements FileOperationsInterface {
  private workspaceRoot: string;

  constructor() {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  }

  async createFile(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const uri = vscode.Uri.file(absolutePath);
      
      // Ensure directory exists
      const dirPath = path.dirname(absolutePath);
      await this.ensureDirectoryExists(dirPath);
      
      // Create file
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      await vscode.workspace.fs.writeFile(uri, data);
      
      // Open file in editor if requested
      const shouldOpen = await this.shouldOpenFile(filePath);
      if (shouldOpen) {
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
      }
      
      console.log(`✅ Created file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to create file ${filePath}:`, error);
      throw error;
    }
  }

  async updateFile(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const uri = vscode.Uri.file(absolutePath);
      
      // Check if file exists
      try {
        await vscode.workspace.fs.stat(uri);
      } catch {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      // Get current content for comparison
      const currentContent = await this.readFile(filePath);
      if (currentContent === content) {
        console.log(`📝 File ${filePath} already has the target content`);
        return;
      }
      
      // Update file
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      await vscode.workspace.fs.writeFile(uri, data);
      
      // Show diff if file is open
      const openEditor = vscode.window.visibleTextEditors.find(
        editor => editor.document.uri.fsPath === absolutePath
      );
      
      if (openEditor) {
        // Refresh the document
        await openEditor.document.save();
      }
      
      console.log(`✅ Updated file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to update file ${filePath}:`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const uri = vscode.Uri.file(absolutePath);
      
      // Check if file exists
      try {
        await vscode.workspace.fs.stat(uri);
      } catch {
        console.log(`📝 File ${filePath} does not exist, skipping deletion`);
        return;
      }
      
      // Close file if open in editor
      const openEditor = vscode.window.visibleTextEditors.find(
        editor => editor.document.uri.fsPath === absolutePath
      );
      
      if (openEditor) {
        await vscode.window.showTextDocument(openEditor.document);
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      }
      
      // Delete file
      await vscode.workspace.fs.delete(uri);
      
      console.log(`✅ Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to delete file ${filePath}:`, error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const uri = vscode.Uri.file(absolutePath);
      
      const data = await vscode.workspace.fs.readFile(uri);
      const decoder = new TextDecoder();
      return decoder.decode(data);
    } catch (error) {
      console.error(`❌ Failed to read file ${filePath}:`, error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      const absolutePath = this.resolveAbsolutePath(dirPath);
      const uri = vscode.Uri.file(absolutePath);
      
      await vscode.workspace.fs.createDirectory(uri);
      
      console.log(`✅ Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`❌ Failed to create directory ${dirPath}:`, error);
      throw error;
    }
  }

  watchFileChanges(filePath: string, callback: (event: vscode.FileChangeEvent) => void): vscode.Disposable {
    const absolutePath = this.resolveAbsolutePath(filePath);
    const uri = vscode.Uri.file(absolutePath);
    
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(path.dirname(absolutePath), path.basename(absolutePath))
    );
    
    const disposables: vscode.Disposable[] = [];
    
    disposables.push(
      watcher.onDidChange((changedUri) => {
        if (changedUri.fsPath === absolutePath) {
          callback({ type: vscode.FileChangeType.Changed, uri: changedUri });
        }
      }),
      
      watcher.onDidCreate((createdUri) => {
        if (createdUri.fsPath === absolutePath) {
          callback({ type: vscode.FileChangeType.Created, uri: createdUri });
        }
      }),
      
      watcher.onDidDelete((deletedUri) => {
        if (deletedUri.fsPath === absolutePath) {
          callback({ type: vscode.FileChangeType.Deleted, uri: deletedUri });
        }
      })
    );
    
    return vscode.Disposable.from(...disposables, watcher);
  }

  private resolveAbsolutePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    
    if (!this.workspaceRoot) {
      throw new Error('No workspace folder open');
    }
    
    return path.join(this.workspaceRoot, filePath);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const uri = vscode.Uri.file(dirPath);
      await vscode.workspace.fs.stat(uri);
    } catch {
      // Directory doesn't exist, create it
      await this.createDirectory(path.relative(this.workspaceRoot, dirPath));
    }
  }

  private async shouldOpenFile(filePath: string): Promise<boolean> {
    // Open certain file types automatically
    const autoOpenExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (autoOpenExtensions.includes(ext)) {
      return true;
    }
    
    // Ask user for other file types
    const result = await vscode.window.showQuickPick(
      ['Yes', 'No'],
      {
        placeHolder: `Open ${path.basename(filePath)} in editor?`,
        ignoreFocusOut: true
      }
    );
    
    return result === 'Yes';
  }

  // Utility methods for common operations
  async applyTextEdit(filePath: string, edit: vscode.TextEdit): Promise<void> {
    const absolutePath = this.resolveAbsolutePath(filePath);
    const uri = vscode.Uri.file(absolutePath);
    
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    
    await editor.edit(editBuilder => {
      editBuilder.replace(edit.range, edit.newText);
    });
    
    await document.save();
  }

  async insertTextAtPosition(filePath: string, line: number, character: number, text: string): Promise<void> {
    const position = new vscode.Position(line, character);
    const edit = new vscode.TextEdit(new vscode.Range(position, position), text);
    await this.applyTextEdit(filePath, edit);
  }

  async replaceTextInRange(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number, newText: string): Promise<void> {
    const startPos = new vscode.Position(startLine, startChar);
    const endPos = new vscode.Position(endLine, endChar);
    const range = new vscode.Range(startPos, endPos);
    const edit = new vscode.TextEdit(range, newText);
    await this.applyTextEdit(filePath, edit);
  }

  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    modified?: Date;
    isDirectory?: boolean;
  }> {
    try {
      const absolutePath = this.resolveAbsolutePath(filePath);
      const uri = vscode.Uri.file(absolutePath);
      const stat = await vscode.workspace.fs.stat(uri);
      
      return {
        exists: true,
        size: stat.size,
        modified: new Date(stat.mtime),
        isDirectory: stat.type === vscode.FileType.Directory
      };
    } catch {
      return { exists: false };
    }
  }
}

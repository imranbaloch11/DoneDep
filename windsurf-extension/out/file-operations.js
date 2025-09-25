"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileOperations = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class FileOperations {
    constructor() {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }
    async createFile(filePath, content) {
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
        }
        catch (error) {
            console.error(`❌ Failed to create file ${filePath}:`, error);
            throw error;
        }
    }
    async updateFile(filePath, content) {
        try {
            const absolutePath = this.resolveAbsolutePath(filePath);
            const uri = vscode.Uri.file(absolutePath);
            // Check if file exists
            try {
                await vscode.workspace.fs.stat(uri);
            }
            catch {
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
            const openEditor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.fsPath === absolutePath);
            if (openEditor) {
                // Refresh the document
                await openEditor.document.save();
            }
            console.log(`✅ Updated file: ${filePath}`);
        }
        catch (error) {
            console.error(`❌ Failed to update file ${filePath}:`, error);
            throw error;
        }
    }
    async deleteFile(filePath) {
        try {
            const absolutePath = this.resolveAbsolutePath(filePath);
            const uri = vscode.Uri.file(absolutePath);
            // Check if file exists
            try {
                await vscode.workspace.fs.stat(uri);
            }
            catch {
                console.log(`📝 File ${filePath} does not exist, skipping deletion`);
                return;
            }
            // Close file if open in editor
            const openEditor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.fsPath === absolutePath);
            if (openEditor) {
                await vscode.window.showTextDocument(openEditor.document);
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            }
            // Delete file
            await vscode.workspace.fs.delete(uri);
            console.log(`✅ Deleted file: ${filePath}`);
        }
        catch (error) {
            console.error(`❌ Failed to delete file ${filePath}:`, error);
            throw error;
        }
    }
    async readFile(filePath) {
        try {
            const absolutePath = this.resolveAbsolutePath(filePath);
            const uri = vscode.Uri.file(absolutePath);
            const data = await vscode.workspace.fs.readFile(uri);
            const decoder = new TextDecoder();
            return decoder.decode(data);
        }
        catch (error) {
            console.error(`❌ Failed to read file ${filePath}:`, error);
            throw error;
        }
    }
    async createDirectory(dirPath) {
        try {
            const absolutePath = this.resolveAbsolutePath(dirPath);
            const uri = vscode.Uri.file(absolutePath);
            await vscode.workspace.fs.createDirectory(uri);
            console.log(`✅ Created directory: ${dirPath}`);
        }
        catch (error) {
            console.error(`❌ Failed to create directory ${dirPath}:`, error);
            throw error;
        }
    }
    watchFileChanges(filePath, callback) {
        const absolutePath = this.resolveAbsolutePath(filePath);
        const uri = vscode.Uri.file(absolutePath);
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(path.dirname(absolutePath), path.basename(absolutePath)));
        const disposables = [];
        disposables.push(watcher.onDidChange((changedUri) => {
            if (changedUri.fsPath === absolutePath) {
                callback({ type: vscode.FileChangeType.Changed, uri: changedUri });
            }
        }), watcher.onDidCreate((createdUri) => {
            if (createdUri.fsPath === absolutePath) {
                callback({ type: vscode.FileChangeType.Created, uri: createdUri });
            }
        }), watcher.onDidDelete((deletedUri) => {
            if (deletedUri.fsPath === absolutePath) {
                callback({ type: vscode.FileChangeType.Deleted, uri: deletedUri });
            }
        }));
        return vscode.Disposable.from(...disposables, watcher);
    }
    resolveAbsolutePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        if (!this.workspaceRoot) {
            throw new Error('No workspace folder open');
        }
        return path.join(this.workspaceRoot, filePath);
    }
    async ensureDirectoryExists(dirPath) {
        try {
            const uri = vscode.Uri.file(dirPath);
            await vscode.workspace.fs.stat(uri);
        }
        catch {
            // Directory doesn't exist, create it
            await this.createDirectory(path.relative(this.workspaceRoot, dirPath));
        }
    }
    async shouldOpenFile(filePath) {
        // Open certain file types automatically
        const autoOpenExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt'];
        const ext = path.extname(filePath).toLowerCase();
        if (autoOpenExtensions.includes(ext)) {
            return true;
        }
        // Ask user for other file types
        const result = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: `Open ${path.basename(filePath)} in editor?`,
            ignoreFocusOut: true
        });
        return result === 'Yes';
    }
    // Utility methods for common operations
    async applyTextEdit(filePath, edit) {
        const absolutePath = this.resolveAbsolutePath(filePath);
        const uri = vscode.Uri.file(absolutePath);
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        await editor.edit(editBuilder => {
            editBuilder.replace(edit.range, edit.newText);
        });
        await document.save();
    }
    async insertTextAtPosition(filePath, line, character, text) {
        const position = new vscode.Position(line, character);
        const edit = new vscode.TextEdit(new vscode.Range(position, position), text);
        await this.applyTextEdit(filePath, edit);
    }
    async replaceTextInRange(filePath, startLine, startChar, endLine, endChar, newText) {
        const startPos = new vscode.Position(startLine, startChar);
        const endPos = new vscode.Position(endLine, endChar);
        const range = new vscode.Range(startPos, endPos);
        const edit = new vscode.TextEdit(range, newText);
        await this.applyTextEdit(filePath, edit);
    }
    async getFileInfo(filePath) {
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
        }
        catch {
            return { exists: false };
        }
    }
}
exports.FileOperations = FileOperations;
//# sourceMappingURL=file-operations.js.map
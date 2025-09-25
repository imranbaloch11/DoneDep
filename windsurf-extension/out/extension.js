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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const websocket_client_1 = require("./websocket-client");
const file_operations_1 = require("./file-operations");
const terminal_manager_1 = require("./terminal-manager");
const git_operations_1 = require("./git-operations");
const error_handler_1 = require("./error-handler");
function activate(context) {
    console.log('🚀 DoneDep Windsurf Extension is now active!');
    // Initialize core services
    const windsurfBridge = new websocket_client_1.WindsurfBridge();
    const fileOps = new file_operations_1.FileOperations();
    const terminalManager = new terminal_manager_1.TerminalManager();
    const gitOps = new git_operations_1.GitOperations();
    const errorHandler = new error_handler_1.ErrorHandler();
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'donedep.connect';
    statusBarItem.text = '$(rocket) DoneDep: Disconnected';
    statusBarItem.tooltip = 'Click to connect to DoneDep';
    statusBarItem.show();
    // Connection state
    let isConnected = false;
    // Update status bar
    const updateStatusBar = (connected, message) => {
        isConnected = connected;
        statusBarItem.text = `$(rocket) DoneDep: ${connected ? 'Connected' : 'Disconnected'}`;
        statusBarItem.tooltip = message || (connected ? 'Connected to DoneDep' : 'Click to connect to DoneDep');
        statusBarItem.command = connected ? 'donedep.disconnect' : 'donedep.connect';
        // Update context for when clauses
        vscode.commands.executeCommand('setContext', 'donedep.connected', connected);
    };
    // Connect command
    const connectCommand = vscode.commands.registerCommand('donedep.connect', async () => {
        const config = vscode.workspace.getConfiguration('donedep');
        const serverUrl = config.get('serverUrl', 'http://localhost:3001');
        try {
            updateStatusBar(false, 'Connecting...');
            // Connect to DoneDep WebSocket
            await windsurfBridge.connect(`${serverUrl.replace('http', 'ws')}/windsurf`);
            updateStatusBar(true, 'Connected to DoneDep');
            vscode.window.showInformationMessage('Successfully connected to DoneDep!');
            // Set up message handlers
            windsurfBridge.onMessage((message) => {
                handleDoneDepMessage(message);
            });
            // Send initial handshake
            await windsurfBridge.sendHandshake({
                extensionVersion: context.extension.packageJSON.version,
                workspaceFolder: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                vsCodeVersion: vscode.version
            });
        }
        catch (error) {
            updateStatusBar(false, 'Connection failed');
            vscode.window.showErrorMessage(`Failed to connect to DoneDep: ${error}`);
        }
    });
    // Disconnect command
    const disconnectCommand = vscode.commands.registerCommand('donedep.disconnect', async () => {
        windsurfBridge.disconnect();
        updateStatusBar(false);
        vscode.window.showInformationMessage('Disconnected from DoneDep');
    });
    // Deploy command
    const deployCommand = vscode.commands.registerCommand('donedep.deploy', async () => {
        if (!isConnected) {
            vscode.window.showWarningMessage('Please connect to DoneDep first');
            return;
        }
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        try {
            const deployMessage = {
                id: `deploy-${Date.now()}`,
                type: 'command',
                action: 'deploy',
                payload: {
                    projectPath: workspaceFolder.uri.fsPath,
                    projectName: workspaceFolder.name
                },
                timestamp: Date.now()
            };
            windsurfBridge.sendMessage(deployMessage);
            vscode.window.showInformationMessage('Deployment request sent to DoneDep');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to send deployment request: ${error}`);
        }
    });
    // Fix error command
    const fixErrorCommand = vscode.commands.registerCommand('donedep.fixError', async () => {
        if (!isConnected) {
            vscode.window.showWarningMessage('Please connect to DoneDep first');
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor');
            return;
        }
        const position = editor.selection.active;
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        try {
            const fixErrorMessage = {
                id: `fix-error-${Date.now()}`,
                type: 'command',
                action: 'fix-error',
                payload: {
                    filePath: editor.document.uri.fsPath,
                    line: position.line,
                    column: position.character,
                    errorText: selectedText,
                    language: editor.document.languageId
                },
                timestamp: Date.now()
            };
            windsurfBridge.sendMessage(fixErrorMessage);
            vscode.window.showInformationMessage('Error fix request sent to DoneDep');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to send error fix request: ${error}`);
        }
    });
    // Show errors command
    const showErrorsCommand = vscode.commands.registerCommand('donedep.showErrors', async () => {
        if (!isConnected) {
            vscode.window.showWarningMessage('Please connect to DoneDep first');
            return;
        }
        // Open DoneDep error dashboard in browser
        const config = vscode.workspace.getConfiguration('donedep');
        const serverUrl = config.get('serverUrl', 'http://localhost:3001');
        const dashboardUrl = serverUrl.replace(':3001', ':3000') + '/deployagent';
        vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
    });
    // Open settings command
    const openSettingsCommand = vscode.commands.registerCommand('donedep.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'donedep');
    });
    // Handle messages from DoneDep
    const handleDoneDepMessage = async (message) => {
        const config = vscode.workspace.getConfiguration('donedep');
        switch (message.action) {
            case 'file.create':
                await fileOps.createFile(message.payload.path, message.payload.content);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage(`Created file: ${message.payload.path}`);
                }
                break;
            case 'file.update':
                await fileOps.updateFile(message.payload.path, message.payload.content);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage(`Updated file: ${message.payload.path}`);
                }
                break;
            case 'file.delete':
                await fileOps.deleteFile(message.payload.path);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage(`Deleted file: ${message.payload.path}`);
                }
                break;
            case 'terminal.execute':
                const result = await terminalManager.executeCommand(message.payload.command, message.payload.cwd);
                const terminalResultMessage = {
                    id: `terminal-result-${Date.now()}`,
                    type: 'response',
                    action: 'terminal.result',
                    payload: {
                        id: message.id,
                        result
                    },
                    timestamp: Date.now()
                };
                windsurfBridge.sendMessage(terminalResultMessage);
                break;
            case 'git.commit':
                await gitOps.commitChanges(message.payload.message, message.payload.files);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage(`Committed changes: ${message.payload.message}`);
                }
                break;
            case 'git.push':
                await gitOps.pushChanges(message.payload.branch);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage('Pushed changes to remote');
                }
                break;
            case 'git.createPR':
                const prUrl = await gitOps.createPullRequest(message.payload.title, message.payload.description);
                if (config.get('notifyOnErrors', true)) {
                    vscode.window.showInformationMessage(`Created PR: ${prUrl}`);
                }
                break;
            case 'error.notify':
                if (config.get('notifyOnErrors', true)) {
                    const action = await vscode.window.showErrorMessage(`DoneDep Error: ${message.payload.message}`, 'View Details', 'Fix Automatically');
                    if (action === 'View Details') {
                        vscode.commands.executeCommand('donedep.showErrors');
                    }
                    else if (action === 'Fix Automatically') {
                        const autofixMessage = {
                            id: `autofix-${Date.now()}`,
                            type: 'command',
                            action: 'error.autofix',
                            payload: {
                                errorId: message.payload.errorId
                            },
                            timestamp: Date.now()
                        };
                        windsurfBridge.sendMessage(autofixMessage);
                    }
                }
                break;
            case 'deployment.status':
                if (config.get('notifyOnErrors', true)) {
                    const status = message.payload.status;
                    if (status === 'success') {
                        vscode.window.showInformationMessage(`Deployment successful! URL: ${message.payload.url}`);
                    }
                    else if (status === 'failed') {
                        vscode.window.showErrorMessage(`Deployment failed: ${message.payload.error}`);
                    }
                }
                break;
            default:
                console.log('Unknown message from DoneDep:', message);
        }
    };
    // Auto-connect on startup if enabled
    const autoConnect = vscode.workspace.getConfiguration('donedep').get('autoConnect', true);
    if (autoConnect) {
        // Delay auto-connect to allow workspace to fully load
        setTimeout(() => {
            vscode.commands.executeCommand('donedep.connect');
        }, 2000);
    }
    // Register all commands
    context.subscriptions.push(connectCommand, disconnectCommand, deployCommand, fixErrorCommand, showErrorsCommand, openSettingsCommand, statusBarItem);
    // Set up error monitoring
    errorHandler.startMonitoring(async (error) => {
        if (isConnected) {
            await windsurfBridge.sendError({
                type: 'workspace',
                level: 'error',
                message: error.message,
                stack: error.stack,
                source: {
                    file: error.file,
                    line: error.line,
                    column: error.column,
                    function: 'unknown'
                },
                context: {
                    workspaceFolder: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                    vsCodeVersion: vscode.version
                }
            });
        }
    });
    // Clean up on deactivation
    context.subscriptions.push({
        dispose: () => {
            windsurfBridge.disconnect();
            errorHandler.stopMonitoring();
        }
    });
}
exports.activate = activate;
function deactivate() {
    console.log('🛑 DoneDep Windsurf Extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
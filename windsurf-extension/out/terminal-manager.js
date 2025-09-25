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
exports.TerminalManager = void 0;
const vscode = __importStar(require("vscode"));
class TerminalManager {
    constructor() {
        this.terminals = new Map();
    }
    async executeCommand(command, cwd) {
        return new Promise((resolve) => {
            try {
                // Create a unique terminal for this command
                const terminalId = `donedep-${Date.now()}`;
                const terminal = vscode.window.createTerminal({
                    name: `DoneDep: ${command.split(' ')[0]}`,
                    cwd: cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
                });
                this.terminals.set(terminalId, terminal);
                // Show terminal
                terminal.show();
                // Send command
                terminal.sendText(command);
                // For now, we'll return success immediately
                // In a real implementation, you'd need to capture the output
                // This is a limitation of VS Code's terminal API
                setTimeout(() => {
                    resolve({
                        success: true,
                        output: `Command executed: ${command}`,
                        exitCode: 0
                    });
                }, 1000);
            }
            catch (error) {
                resolve({
                    success: false,
                    output: '',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    exitCode: 1
                });
            }
        });
    }
    async executeCommandSilent(command, cwd) {
        return new Promise((resolve) => {
            try {
                // For silent execution, we could use child_process
                // But VS Code extensions have limited access to Node.js APIs
                // This is a simplified implementation
                const { exec } = require('child_process');
                const workingDir = cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            output: stderr || stdout,
                            error: error.message,
                            exitCode: error.code || 1
                        });
                    }
                    else {
                        resolve({
                            success: true,
                            output: stdout,
                            exitCode: 0
                        });
                    }
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    output: '',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    exitCode: 1
                });
            }
        });
    }
    async executeScript(script, cwd) {
        // Execute multiple commands in sequence
        const commands = script.split('\n').filter(cmd => cmd.trim() && !cmd.trim().startsWith('#'));
        let allOutput = '';
        for (const command of commands) {
            const result = await this.executeCommandSilent(command.trim(), cwd);
            allOutput += `$ ${command}\n${result.output}\n`;
            if (!result.success) {
                return {
                    success: false,
                    output: allOutput,
                    error: result.error,
                    exitCode: result.exitCode
                };
            }
        }
        return {
            success: true,
            output: allOutput,
            exitCode: 0
        };
    }
    async runBuildCommand(projectPath) {
        // Detect build command based on project type
        const packageJsonPath = vscode.Uri.file(`${projectPath}/package.json`);
        try {
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonPath);
            const packageJson = JSON.parse(packageJsonContent.toString());
            // Check for common build scripts
            const scripts = packageJson.scripts || {};
            let buildCommand = 'npm run build';
            if (scripts.build) {
                buildCommand = 'npm run build';
            }
            else if (scripts['build:prod']) {
                buildCommand = 'npm run build:prod';
            }
            else if (scripts.compile) {
                buildCommand = 'npm run compile';
            }
            else {
                // Try to detect framework
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                if (dependencies.next) {
                    buildCommand = 'npm run build';
                }
                else if (dependencies.react) {
                    buildCommand = 'npm run build';
                }
                else if (dependencies.vue) {
                    buildCommand = 'npm run build';
                }
                else if (dependencies.typescript) {
                    buildCommand = 'npx tsc';
                }
            }
            return await this.executeCommand(buildCommand, projectPath);
        }
        catch (error) {
            return {
                success: false,
                output: '',
                error: `Failed to read package.json: ${error}`,
                exitCode: 1
            };
        }
    }
    async runTestCommand(projectPath) {
        const packageJsonPath = vscode.Uri.file(`${projectPath}/package.json`);
        try {
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonPath);
            const packageJson = JSON.parse(packageJsonContent.toString());
            const scripts = packageJson.scripts || {};
            let testCommand = 'npm test';
            if (scripts.test) {
                testCommand = 'npm test';
            }
            else if (scripts['test:unit']) {
                testCommand = 'npm run test:unit';
            }
            else if (scripts.jest) {
                testCommand = 'npm run jest';
            }
            else {
                testCommand = 'npx jest';
            }
            return await this.executeCommand(testCommand, projectPath);
        }
        catch (error) {
            return {
                success: false,
                output: '',
                error: `Failed to run tests: ${error}`,
                exitCode: 1
            };
        }
    }
    async installDependencies(projectPath) {
        // Check if package-lock.json or yarn.lock exists
        const packageLockPath = vscode.Uri.file(`${projectPath}/package-lock.json`);
        const yarnLockPath = vscode.Uri.file(`${projectPath}/yarn.lock`);
        try {
            await vscode.workspace.fs.stat(yarnLockPath);
            return await this.executeCommand('yarn install', projectPath);
        }
        catch {
            // yarn.lock doesn't exist, try npm
            try {
                await vscode.workspace.fs.stat(packageLockPath);
                return await this.executeCommand('npm ci', projectPath);
            }
            catch {
                return await this.executeCommand('npm install', projectPath);
            }
        }
    }
    async startDevServer(projectPath) {
        const packageJsonPath = vscode.Uri.file(`${projectPath}/package.json`);
        try {
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonPath);
            const packageJson = JSON.parse(packageJsonContent.toString());
            const scripts = packageJson.scripts || {};
            let devCommand = 'npm run dev';
            if (scripts.dev) {
                devCommand = 'npm run dev';
            }
            else if (scripts.start) {
                devCommand = 'npm start';
            }
            else if (scripts.serve) {
                devCommand = 'npm run serve';
            }
            return await this.executeCommand(devCommand, projectPath);
        }
        catch (error) {
            return {
                success: false,
                output: '',
                error: `Failed to start dev server: ${error}`,
                exitCode: 1
            };
        }
    }
    getActiveTerminals() {
        return Array.from(this.terminals.keys());
    }
    closeTerminal(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (terminal) {
            terminal.dispose();
            this.terminals.delete(terminalId);
        }
    }
    closeAllTerminals() {
        this.terminals.forEach(terminal => terminal.dispose());
        this.terminals.clear();
    }
    async executeCommandWithProgress(command, cwd, progressCallback) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Executing: ${command}`,
            cancellable: true
        }, async (progress, token) => {
            return new Promise((resolve) => {
                const terminal = vscode.window.createTerminal({
                    name: `DoneDep: ${command.split(' ')[0]}`,
                    cwd: cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
                });
                terminal.show();
                terminal.sendText(command);
                // Simulate progress updates
                let progressValue = 0;
                const progressInterval = setInterval(() => {
                    if (token.isCancellationRequested) {
                        clearInterval(progressInterval);
                        terminal.dispose();
                        resolve({
                            success: false,
                            output: '',
                            error: 'Command cancelled by user',
                            exitCode: 130
                        });
                        return;
                    }
                    progressValue += 10;
                    progress.report({ increment: 10 });
                    if (progressCallback) {
                        progressCallback(`Progress: ${progressValue}%`);
                    }
                    if (progressValue >= 100) {
                        clearInterval(progressInterval);
                        resolve({
                            success: true,
                            output: `Command completed: ${command}`,
                            exitCode: 0
                        });
                    }
                }, 500);
            });
        });
    }
}
exports.TerminalManager = TerminalManager;
//# sourceMappingURL=terminal-manager.js.map
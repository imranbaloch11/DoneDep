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
exports.GitOperations = void 0;
const vscode = __importStar(require("vscode"));
const terminal_manager_1 = require("./terminal-manager");
class GitOperations {
    constructor() {
        this.terminalManager = new terminal_manager_1.TerminalManager();
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }
    async getStatus() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git status --porcelain -b', this.workspaceRoot);
            if (!result.success) {
                throw new Error(result.error || 'Failed to get git status');
            }
            const lines = result.output.split('\n').filter(line => line.trim());
            const branchLine = lines.find(line => line.startsWith('##'));
            let branch = 'main';
            let ahead = 0;
            let behind = 0;
            if (branchLine) {
                const branchMatch = branchLine.match(/## ([^.]+)/);
                if (branchMatch) {
                    branch = branchMatch[1];
                }
                const aheadMatch = branchLine.match(/ahead (\d+)/);
                const behindMatch = branchLine.match(/behind (\d+)/);
                if (aheadMatch)
                    ahead = parseInt(aheadMatch[1]);
                if (behindMatch)
                    behind = parseInt(behindMatch[1]);
            }
            const staged = [];
            const unstaged = [];
            const untracked = [];
            lines.forEach(line => {
                if (line.startsWith('##'))
                    return;
                const status = line.substring(0, 2);
                const file = line.substring(3);
                if (status[0] !== ' ' && status[0] !== '?') {
                    staged.push(file);
                }
                if (status[1] !== ' ') {
                    if (status[1] === '?') {
                        untracked.push(file);
                    }
                    else {
                        unstaged.push(file);
                    }
                }
            });
            return {
                branch,
                hasChanges: staged.length > 0 || unstaged.length > 0 || untracked.length > 0,
                staged,
                unstaged,
                untracked,
                ahead,
                behind
            };
        }
        catch (error) {
            console.error('Failed to get git status:', error);
            return {
                branch: 'unknown',
                hasChanges: false,
                staged: [],
                unstaged: [],
                untracked: [],
                ahead: 0,
                behind: 0
            };
        }
    }
    async stageFiles(files) {
        try {
            const fileList = files.map(f => `"${f}"`).join(' ');
            const result = await this.terminalManager.executeCommandSilent(`git add ${fileList}`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to stage files:', error);
            return false;
        }
    }
    async stageAllFiles() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git add .', this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to stage all files:', error);
            return false;
        }
    }
    async commitChanges(message, files) {
        try {
            // Stage files if provided
            if (files && files.length > 0) {
                const stageResult = await this.stageFiles(files);
                if (!stageResult) {
                    throw new Error('Failed to stage files');
                }
            }
            // Commit with message
            const escapedMessage = message.replace(/"/g, '\\"');
            const result = await this.terminalManager.executeCommandSilent(`git commit -m "${escapedMessage}"`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to commit changes:', error);
            return false;
        }
    }
    async pushChanges(branch) {
        try {
            const targetBranch = branch || 'origin HEAD';
            const result = await this.terminalManager.executeCommandSilent(`git push ${targetBranch}`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to push changes:', error);
            return false;
        }
    }
    async pullChanges(branch) {
        try {
            const targetBranch = branch || '';
            const result = await this.terminalManager.executeCommandSilent(`git pull ${targetBranch}`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to pull changes:', error);
            return false;
        }
    }
    async createBranch(branchName, checkout = true) {
        try {
            const command = checkout ? `git checkout -b ${branchName}` : `git branch ${branchName}`;
            const result = await this.terminalManager.executeCommandSilent(command, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to create branch:', error);
            return false;
        }
    }
    async switchBranch(branchName) {
        try {
            const result = await this.terminalManager.executeCommandSilent(`git checkout ${branchName}`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to switch branch:', error);
            return false;
        }
    }
    async createPullRequest(title, description, baseBranch = 'main') {
        try {
            // First, get the current branch
            const status = await this.getStatus();
            const currentBranch = status.branch;
            // Push current branch if it has changes
            if (status.hasChanges || status.ahead > 0) {
                const pushResult = await this.pushChanges(`origin ${currentBranch}`);
                if (!pushResult) {
                    throw new Error('Failed to push branch before creating PR');
                }
            }
            // Try to use GitHub CLI if available
            const ghResult = await this.terminalManager.executeCommandSilent(`gh pr create --title "${title}" --body "${description}" --base ${baseBranch} --head ${currentBranch}`, this.workspaceRoot);
            if (ghResult.success) {
                // Extract PR URL from output
                const urlMatch = ghResult.output.match(/https:\/\/github\.com\/[^\s]+/);
                return urlMatch ? urlMatch[0] : 'PR created successfully';
            }
            // Fallback: provide instructions for manual PR creation
            const repoResult = await this.terminalManager.executeCommandSilent('git remote get-url origin', this.workspaceRoot);
            if (repoResult.success) {
                const repoUrl = repoResult.output.trim();
                const githubUrl = repoUrl.replace('.git', '').replace('git@github.com:', 'https://github.com/');
                const prUrl = `${githubUrl}/compare/${baseBranch}...${currentBranch}?quick_pull=1`;
                vscode.env.openExternal(vscode.Uri.parse(prUrl));
                return prUrl;
            }
            throw new Error('Could not determine repository URL');
        }
        catch (error) {
            console.error('Failed to create pull request:', error);
            return null;
        }
    }
    async getCommitHistory(limit = 10) {
        try {
            const result = await this.terminalManager.executeCommandSilent(`git log --oneline --format="%H|%s|%an|%ad" --date=iso -${limit}`, this.workspaceRoot);
            if (!result.success) {
                return [];
            }
            return result.output.split('\n')
                .filter(line => line.trim())
                .map(line => {
                const [hash, message, author, date] = line.split('|');
                return {
                    hash: hash?.substring(0, 8) || '',
                    message: message || '',
                    author: author || '',
                    date: new Date(date || '')
                };
            });
        }
        catch (error) {
            console.error('Failed to get commit history:', error);
            return [];
        }
    }
    async getDiff(file) {
        try {
            const command = file ? `git diff "${file}"` : 'git diff';
            const result = await this.terminalManager.executeCommandSilent(command, this.workspaceRoot);
            return result.success ? result.output : '';
        }
        catch (error) {
            console.error('Failed to get diff:', error);
            return '';
        }
    }
    async resetFile(file) {
        try {
            const result = await this.terminalManager.executeCommandSilent(`git checkout -- "${file}"`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to reset file:', error);
            return false;
        }
    }
    async resetAllChanges() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git reset --hard HEAD', this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to reset all changes:', error);
            return false;
        }
    }
    async stashChanges(message) {
        try {
            const command = message ? `git stash push -m "${message}"` : 'git stash';
            const result = await this.terminalManager.executeCommandSilent(command, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to stash changes:', error);
            return false;
        }
    }
    async popStash() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git stash pop', this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to pop stash:', error);
            return false;
        }
    }
    async getRemoteUrl() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git remote get-url origin', this.workspaceRoot);
            return result.success ? result.output.trim() : null;
        }
        catch (error) {
            console.error('Failed to get remote URL:', error);
            return null;
        }
    }
    async isGitRepository() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git rev-parse --git-dir', this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            return false;
        }
    }
    async initRepository() {
        try {
            const result = await this.terminalManager.executeCommandSilent('git init', this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to initialize git repository:', error);
            return false;
        }
    }
    async addRemote(name, url) {
        try {
            const result = await this.terminalManager.executeCommandSilent(`git remote add ${name} ${url}`, this.workspaceRoot);
            return result.success;
        }
        catch (error) {
            console.error('Failed to add remote:', error);
            return false;
        }
    }
}
exports.GitOperations = GitOperations;
//# sourceMappingURL=git-operations.js.map
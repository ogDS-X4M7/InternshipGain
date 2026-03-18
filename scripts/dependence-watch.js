#!/usr/bin/env node

/**
 * 依赖变动识别工具
 * 支持pnpm、npm包管理器
 * 只负责发现变动，不修复任何问题
 */

// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class DependencyWatcher {
    constructor() {
        this.projectRoot = process.cwd();
        this.baselineFile = path.join(this.projectRoot, '.dependency-baseline.json');
        this.changes = [];

        // 支持的lockfile类型
        this.lockfileTypes = {
            'pnpm-lock.yaml': 'pnpm',
            'package-lock.json': 'npm'
        };
    }


    /**
     * 解析pnpm lockfile (pnpm-lock.yaml)
     */
    parsePnpmLockfile(lockfilePath) {
        try {
            const content = fs.readFileSync(lockfilePath, 'utf8');
            // 使用文件内容的哈希值作为依赖标识
            const crypto = require('crypto');
            const hash = crypto.createHash('md5').update(content).digest('hex');

            // 简单统计包数量
            let packageCount = 0;
            const lines = content.split('\n');
            lines.forEach(line => {
                if (line.match(/^\/[^\/]+@/)) {
                    packageCount++;
                }
            });

            return {
                _hash: hash,
                _packageCount: packageCount,
                _lastModified: fs.statSync(lockfilePath).mtime.toISOString()
            };
        } catch (error) {
            return {};
        }
    }


    /**
     * 获取git diff信息
     */
    getGitDiff() {
        try {
            // 检测项目使用的lock文件类型
            const lockFiles = ['package-lock.json', 'pnpm-lock.yaml'];
            let lockFile = null;

            for (const file of lockFiles) {
                const lockPath = path.join(this.projectRoot, file);
                if (fs.existsSync(lockPath)) {
                    lockFile = file;
                    break;
                }
            }

            if (!lockFile) {
                console.warn('⚠️  未找到lock文件');
                return '';
            }

            const diff = execSync(`git diff origin/main -- ${lockFile}`, {
                encoding: 'utf8',
                cwd: this.projectRoot
            });
            // 调试输出
            if (diff.trim()) {
                console.log('📄 原始git diff输出:');
                console.log(diff);
            }
            return diff;
        } catch (error) {
            console.warn('⚠️  获取git diff失败:', error.message);
            return '';
        }
    }

    /**
     * 解析git diff中的依赖变动
     */
    parseGitDiff(diff) {
        const changes = [];

        if (!diff.trim()) {
            return changes;
        }

        // 将diff按行分割
        const lines = diff.split('\n');

        // 检测package-lock.json的变动
        if (diff.includes('package-lock.json')) {
            return this.parsePackageLockDiff(lines);
        }

        // 检测pnpm-lock.yaml的变动
        return this.parsePnpmLockDiff(lines);
    }

    /**
     * 解析package-lock.json的git diff
     */
    parsePackageLockDiff(lines) {
        const changes = [];
        const versionChanges = new Map();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 匹配以-或+开头的version行
            const versionMatch = line.match(/^([+-])\s+"version":\s+"([^"]+)"/);
            if (versionMatch) {
                const [, sign, version] = versionMatch;

                // 获取上一行（包名行）
                if (i > 0) {
                    const packageLine = lines[i - 1];
                    const packageMatch = packageLine.match(/^([+-])?\s*"([^"]+)":\s*\{/);

                    if (packageMatch) {
                        const [, packageSign, packagePath] = packageMatch;

                        // 提取包名（去掉node_modules/前缀）
                        let packageName = packagePath;
                        if (packagePath.startsWith('node_modules/')) {
                            packageName = packagePath.substring('node_modules/'.length);

                            // 判断变动类型
                            if (packageSign === '-') {
                                // 整个包被删除
                                versionChanges.set(packageName, { from: version, to: '被移除' });
                            } else if (packageSign === '+') {
                                // 整个包是新增的
                                versionChanges.set(packageName, { from: '新增依赖', to: version });
                            } else {
                                // 版本变更，需要找到对应的+version
                                if (sign === '-') {
                                    // 这是旧版本，需要找新版本
                                    let newVersion = null;

                                    // 在当前包定义范围内查找+version
                                    // 注意：存在极端情况，大量依赖同时变动，例如大量删除，不做多余的容错处理，保证机制正确的情况下允许大量查找匹配
                                    for (let j = i + 1; j < lines.length; j++) {
                                        const nextLine = lines[j];

                                        // 如果遇到其他包的定义，停止搜索
                                        // if (nextLine.match(/^([+-])?\s*"[^"]+":\s*\{/)) {
                                        //   break;
                                        // }

                                        const newVersionMatch = nextLine.match(/^\+\s+"version":\s+"([^"]+)"/);
                                        if (newVersionMatch) {
                                            newVersion = newVersionMatch[1];
                                            break;
                                        }
                                    }

                                    if (newVersion) {
                                        versionChanges.set(packageName, { from: version, to: newVersion });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 添加所有检测到的变动
        versionChanges.forEach((change, packageName) => {
            changes.push({
                type: 'git-version-changed',
                package: packageName,
                from: change.from,
                to: change.to,
                message: `${packageName}: ${change.from} → ${change.to}`
            });
        });

        return changes;
    }

    /**
     * 解析pnpm-lock.yaml的diff变动
     */
    parsePnpmLockDiff(lines) {
        const changes = [];

        // // 检测packages和snapshots部分的包版本变动
        // for (let i = 0; i < lines.length; i++) {
        //   const line = lines[i];

        //   // 检测packages部分的包名变动
        //   if (line.startsWith('-  ') && line.includes('@') && line.includes(':')) {
        //     const removed = line.substring(2).trim();

        //     // 查找对应的添加行
        //     for (let j = i + 1; j < lines.length; j++) {
        //       const nextLine = lines[j];
        //       if (nextLine.startsWith('+  ') && nextLine.includes('@') && nextLine.includes(':')) {
        //         const added = nextLine.substring(2).trim();

        //         // 提取包名和版本
        //         const removedMatch = removed.match(/^['"]?([^@]+@[^"]+)['"]?:$/);
        //         const addedMatch = added.match(/^['"]?([^@]+@[^"]+)['"]?:$/);

        //         if (removedMatch && addedMatch) {
        //           const removedFull = removedMatch[1];
        //           const addedFull = addedMatch[1];

        //           // 提取包名（去掉版本号）
        //           const packageName = removedFull.replace(/@[^@]+$/, '');
        //           const oldVersion = removedFull.substring(packageName.length + 1);
        //           const newVersion = addedFull.substring(packageName.length + 1);

        //           if (oldVersion !== newVersion) {
        //             changes.push({
        //               type: 'git-version-changed',
        //               package: packageName,
        //               from: oldVersion,
        //               to: newVersion,
        //               message: `${packageName}: ${oldVersion} → ${newVersion}`
        //             });
        //           }
        //         }
        //         break;
        //       }
        //     }
        //   }
        // }

        // 检测importers部分的version字段变动
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // 匹配以-或+开头的version行
            const versionMatch = line.match(/^([+-])\s+version:\s*(.+)/);
            if (versionMatch) {
                const [, sign, version] = versionMatch;

                // 获取上一行（包名行）
                if (i > 1) {
                    const packageLine = lines[i - 2];
                    const packageMatch = packageLine.match(/^([+-])?\s*([^:]+):$/);

                    if (packageMatch) {
                        const [, packageSign, packageName] = packageMatch;
                        // 判断变动类型
                        if (packageSign === '-') {
                            // 整个包被删除
                            changes.push({
                                type: 'git-version-changed',
                                package: packageName,
                                from: version,
                                to: '被移除',
                                message: `${packageName}: ${version} → ${'被移除'}`
                            });
                        } else if (packageSign === '+') {
                            // 整个包是新增的
                            changes.push({
                                type: 'git-version-changed',
                                package: packageName,
                                from: '新增依赖',
                                to: version,
                                message: `${packageName}: ${'新增依赖'} → ${version}`
                            });
                        } else {
                            // 版本变更，需要找到对应的+version
                            if (sign === '-') {
                                // 这是旧版本，需要找新版本
                                let newVersion = null;

                                // 在当前包定义范围内查找+version
                                // 注意：存在极端情况，大量依赖同时变动，例如大量删除，不做多余的容错处理，保证机制正确的情况下允许大量查找匹配
                                for (let j = i + 1; j < lines.length; j++) {
                                    const nextLine = lines[j];

                                    // 如果遇到其他包的定义，停止搜索
                                    // if (nextLine.match(/^([+-])?\s*([^:]+):/)) {
                                    //   break;
                                    // }

                                    const newVersionMatch = nextLine.match(/^\+\s+version:\s*(.+)/);
                                    if (newVersionMatch) {
                                        newVersion = newVersionMatch[1];
                                        break;
                                    }
                                }

                                if (newVersion) {
                                    changes.push({
                                        type: 'git-version-changed',
                                        package: packageName,
                                        from: version,
                                        to: newVersion,
                                        message: `${packageName}: ${version} → ${newVersion}`
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return changes;
    }


    /**
     * 检测git变动
     */
    detectGitChanges() {
        const diff = this.getGitDiff();
        if (!diff.trim()) {
            return [];
        }

        console.log('🔍 检测到git变动，正在分析...');
        return this.parseGitDiff(diff);
    }

    /**
     * 生成报告
     */
    generateReport() {

        // 检测git变动
        const gitChanges = this.detectGitChanges();
        if (gitChanges.length === 0) {
            console.log('✅ 未发现依赖变动');
            return;
        }

        console.log(`\n📊 发现 ${gitChanges.length} 处依赖变动：\n`);

        gitChanges.forEach((change, index) => {
            console.log(`${index + 1}. ${change.message}`);
        });

        console.log('\n📋 变动详情已记录');
    }

    /**
     * 主函数
     */
    run() {
        const args = process.argv.slice(2);

        if (args.includes('--preinstall')) {
            this.handlePreinstall();
        } else if (args.includes('--baseline')) {
            this.createBaseline();
        } else {
            this.generateReport();
        }
    }
}

// 运行
const watcher = new DependencyWatcher();
watcher.run();
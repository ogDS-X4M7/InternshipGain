#!/usr/bin/env node

/**
 * package-lock.json 版本冲突检测工具
 * 检测同一包在不同位置出现不同版本的情况
 */

const fs = require('fs');
const path = require('path');

class LockConflictDetector {
  constructor() {
    this.projectRoot = process.cwd();
    this.lockfilePath = path.join(this.projectRoot, 'package-lock.json');
  }

  /**
   * 从完整包路径中提取包名
   * 规则：提取最后一个node_modules后的部分作为包名
   */
  extractPackageName(fullPath) {
    const parts = fullPath.split('/');
    const nodeModulesIndex = parts.lastIndexOf('node_modules');
    
    if (nodeModulesIndex !== -1 && nodeModulesIndex < parts.length - 1) {
      return parts.slice(nodeModulesIndex + 1).join('/');
    }
    
  }

  /**
   * 解析package-lock.json并收集所有包信息
   */
  parseLockfile() {
    if (!fs.existsSync(this.lockfilePath)) {
      throw new Error('package-lock.json 文件不存在');
    }

    const lockfile = JSON.parse(fs.readFileSync(this.lockfilePath, 'utf8'));
    
    if (!lockfile.packages) {
      throw new Error('package-lock.json 格式不正确，缺少packages字段');
    }

    const packageMap = new Map(); // 包名 -> {版本 -> 位置列表}

    // 遍历所有packages
    for (const [fullPath, packageInfo] of Object.entries(lockfile.packages)) {
      if (!packageInfo) continue;
      if(packageInfo.dev || packageInfo.optional)continue;

      const packageName = this.extractPackageName(fullPath);
      const version = packageInfo.version;
      
      if (!version) continue;

      // 存储包信息
      if (!packageMap.has(packageName)) {
        packageMap.set(packageName, new Map());
      }

      const versionMap = packageMap.get(packageName);
      if (!versionMap.has(version)) {
        versionMap.set(version, []);
      }

      versionMap.get(version).push({
        fullPath,
        resolved: packageInfo.resolved,
        integrity: packageInfo.integrity,
        // dev: packageInfo.dev,
        // optional: packageInfo.optional
      });
    }

    return packageMap;
  }

  /**
   * 检测版本冲突
   */
  detectConflicts() {
    console.log('🔍 正在分析 package-lock.json 中的版本冲突...\n');
    
    const packageMap = this.parseLockfile();
    const conflicts = [];

    for (const [packageName, versionMap] of packageMap) {
      if (versionMap.size > 1) {
        // 发现版本冲突
        const versions = Array.from(versionMap.keys());
        const locations = new Map();
        
        // 收集所有版本的位置信息
        for (const [version, positions] of versionMap) {
          locations.set(version, positions);
        }

        conflicts.push({
          packageName,
          versions,
          locations,
          conflictCount: versions.length
        });
      }
    }

    return conflicts;
  }

  /**
   * 使用流式写入生成报告，减少内存消耗
   */
  generateReport() {
    let outputPath = 'lock-conflicts-report.txt';
    try {
      const conflicts = this.detectConflicts();
      
      // 使用流式写入
      const outputStream = fs.createWriteStream(path.join(this.projectRoot, outputPath))

      const write = (text) => {
        outputStream.write(text + '\n');
      };

      if (conflicts.length === 0) {
        write('✅ 未发现版本冲突');
        outputStream.end();
        return;
      }

      write(`📊 发现 ${conflicts.length} 个包存在版本冲突：\n`);

      conflicts.forEach((conflict, index) => {
        write(`${index + 1}. 📦 ${conflict.packageName}`);
        write(`   冲突版本数: ${conflict.conflictCount}`);
        write(`   版本列表: ${conflict.versions.join(', ')}`);
        write('   详细位置:');
        for (const [version, positions] of conflict.locations) {
          write(`     ${version}:`);
          positions.forEach(pos => {
            write(`       - ${pos.fullPath}`);
          });
        }
        write('');
      });

      // 生成统计信息
      const totalConflicts = conflicts.reduce((sum, c) => sum + c.conflictCount, 0);
      write(`📈 统计信息:`);
      write(`   冲突包总数: ${conflicts.length}`);
      write(`   冲突版本总数: ${totalConflicts}`);
      outputStream.end();
      console.log(`📄 报告已保存到 ${outputPath}`);
      
      
    } catch (error) {
      console.error('❌ 检测失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 使用流式写入导出冲突数据为JSON
   */
  exportToJson(outputPath = 'lock-conflicts.json') {
    try {
      const conflicts = this.detectConflicts();
      
      // 使用流式写入JSON
      const output = {
        timestamp: new Date().toISOString(),
        conflicts: conflicts.map(conflict => ({
          packageName: conflict.packageName,
          versions: conflict.versions,
          locations: Object.fromEntries(
            Array.from(conflict.locations.entries()).map(([version, positions]) => [
              version,
              positions.map(pos => ({
                path: pos.fullPath,
                resolved: pos.resolved,
                optional: pos.optional || false
              }))
            ])
          )
        }))
      };

      const writeStream = fs.createWriteStream(path.join(this.projectRoot, outputPath));
      writeStream.write(JSON.stringify(output, null, 2));
      writeStream.end();
      
      console.log(`📄 冲突数据已导出到 ${outputPath}`);
      
    } catch (error) {
      console.error('❌ 导出失败:', error.message);
      process.exit(1);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const detector = new LockConflictDetector();
  const args = process.argv.slice(2);

  if (args.includes('--export')) {
    const outputIndex = args.indexOf('--export');
    const outputPath = args[outputIndex + 1] || 'lock-conflicts.json';
    detector.exportToJson(outputPath);
  } else {
    detector.generateReport();
  }
}

module.exports = LockConflictDetector;
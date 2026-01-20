#!/bin/bash
# 日志系统迁移脚本

cd "$(dirname "$0")/src/routes"

echo "正在迁移日志系统..."

# 备份原文件
cp images.ts images.ts.backup
cp config.ts config.ts.backup

# 1. 在 images.ts 顶部添加 logger 导入
sed -i '' '7a\
import { logger } from '"'"'../utils/logger.js'"'"'
' images.ts

# 2. 替换所有 console.log/error 为 logger
sed -i '' 's/console\.log(`\[AI\] 图片过大/logger.debug(`[AI] 图片过大/g' images.ts
sed -i '' 's/console\.log(`\[AI\] 压缩完成/logger.debug(`[AI] 压缩完成/g' images.ts
sed -i '' 's/console\.error('"'"'\[AI\] 图片压缩失败/logger.error('"'"'[AI] 图片压缩失败/g' images.ts
sed -i '' 's/console\.error(`\[AI\] Zhipu API 错误响应/logger.error(`[AI] Zhipu API 错误响应/g' images.ts
sed -i '' 's/console\.error(`\[AI\] SiliconFlow API 错误响应/logger.error(`[AI] SiliconFlow API 错误响应/g' images.ts
sed -i '' 's/console\.log(`\[Upload\] Received/logger.info(`[Upload] Received/g' images.ts
sed -i '' 's/console\.error(`Failed to get dimensions/logger.warn(`Failed to get dimensions/g' images.ts
sed -i '' 's/console\.log(`\[Upload\] ✅ Saved/logger.info(`[Upload] ✅ Saved/g' images.ts
sed -i '' 's/console\.log(`\[AI\] 开始异步自动打标/logger.debug(`[AI] 开始异步自动打标/g' images.ts
sed -i '' 's/console\.log(`\[AI\] 成功生成标签/logger.debug(`[AI] 成功生成标签/g' images.ts
sed -i '' 's/console\.error(`\[AI\] 图片/logger.error(`[AI] 图片/g' images.ts
sed -i '' 's/console\.log(`\[AI\] ✅ 标签已更新/logger.debug(`[AI] ✅ 标签已更新/g' images.ts
sed -i '' 's/console\.log(`\[AI\] ⚠️ 没有新标签/logger.debug(`[AI] ⚠️ 没有新标签/g' images.ts
sed -i '' 's/console\.error(`\[AI\] 自动打标失败/logger.error(`[AI] 自动打标失败/g' images.ts
sed -i '' 's/console\.log(`\[Upload\] 🎉 Successfully/logger.info(`[Upload] 🎉 Successfully/g' images.ts
sed -i '' 's/console\.log(`\[Batch Retag\] 开始批量打标/logger.info(`[Batch Retag] 开始批量打标/g' images.ts
sed -i '' 's/console\.log(`\[Batch Retag\] 处理中/logger.debug(`[Batch Retag] 处理中/g' images.ts
sed -i '' 's/console\.error(`\[Batch Retag\] 无法读取/logger.error(`[Batch Retag] 无法读取/g' images.ts
sed -i '' 's/console\.log(`\[Batch Retag\] ✅/logger.info(`[Batch Retag] ✅/g' images.ts
sed -i '' 's/console\.error(`\[Batch Retag\] ❌/logger.error(`[Batch Retag] ❌/g' images.ts
sed -i '' 's/console\.log(`\[Batch Retag\] 完成/logger.info(`[Batch Retag] 完成/g' images.ts

# 3. 在 config.ts 顶部添加 logger 导入
sed -i '' '4a\
import { logger } from '"'"'../utils/logger.js'"'"'
' config.ts

# 4. 替换 config.ts 中的日志
sed -i '' 's/console\.log(`\[AI Test\] Testing/logger.debug(`[AI Test] Testing/g' config.ts
sed -i '' 's/console\.log(`\[AI Test\] Success/logger.debug(`[AI Test] Success/g' config.ts
sed -i '' 's/console\.error(`\[AI Test\]/logger.error(`[AI Test]/g' config.ts
sed -i '' "s/console\.error('\[AI Test\]/logger.error('[AI Test]/g" config.ts

echo "✅ 日志系统迁移完成！"
echo "备份文件已创建: images.ts.backup, config.ts.backup"

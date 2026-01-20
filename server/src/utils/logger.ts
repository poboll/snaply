/**
 * 日志工具
 * 支持不同的日志级别，通过环境变量 LOG_LEVEL 控制
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  'debug': LogLevel.DEBUG,
  'info': LogLevel.INFO,
  'warn': LogLevel.WARN,
  'error': LogLevel.ERROR,
  'silent': LogLevel.SILENT
}

class Logger {
  private currentLevel: LogLevel

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info'
    this.currentLevel = LOG_LEVEL_MAP[envLevel] ?? LogLevel.INFO

    if (this.currentLevel <= LogLevel.INFO) {
      console.log(`[Logger] Log level set to: ${envLevel.toUpperCase()}`)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level}]`
    return `${prefix} ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args)
    }
  }

  // 简化的日志方法（兼容现有代码）
  log(tag: string, message: string, ...args: any[]): void {
    this.info(`[${tag}] ${message}`, ...args)
  }
}

export const logger = new Logger()

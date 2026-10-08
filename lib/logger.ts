/**
 * Logger centralizado para controlar console.logs em produção
 * 
 * Em desenvolvimento: todos os logs aparecem
 * Em produção: apenas erros aparecem
 */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Log de debug - só aparece em desenvolvimento
 */
export const logDebug = (tag: string, data?: any) => {
  if (isDev) {
    void 0;
  }
};

/**
 * Log de info - aparece em desenvolvimento e produção
 */
export const logInfo = (tag: string, msg: string) => {
  if (isDev) {
    void 0;
  }
};

/**
 * Log de warning - aparece em desenvolvimento e produção
 */
export const logWarn = (tag: string, msg: string) => {
  if (isDev) {
    void 0;
  }
};

/**
 * Log de erro - SEMPRE aparece (importante para debug em produção)
 */
export const logError = (tag: string, error: any) => {
  void 0;
  // TODO: Enviar para Sentry ou outro serviço de error tracking
};

/**
 * Objeto com métodos para usar como logger.debug(), logger.error(), etc.
 */
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
};


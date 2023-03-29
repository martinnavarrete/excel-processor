enum ServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  OTHER = 'OTHER',
}

class ServiceError extends Error {
  public code: ServiceErrorCode;

  constructor(message: string, code: ServiceErrorCode) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export { ServiceError, ServiceErrorCode };

class FormatValidationError extends Error {
  public column: string;

  constructor(message: string, column: string) {
    super(message);
    this.name = 'FormatValidationError';
    this.column = column;
  }
}

export default FormatValidationError;

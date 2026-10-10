// A known, expected error with an HTTP status code attached.
export class AppError extends Error {
  constructor(message, status_code) {
    super(message);
    this.status_code = status_code;
  }
}

import { AppError } from '../app-error';

export class LoanSchemeNotFoundError extends AppError {
  constructor() {
    super('Loan scheme not found', 404);
    this.name = 'LoanSchemeNotFoundError';
  }
}

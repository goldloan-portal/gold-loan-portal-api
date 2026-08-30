import { AppError } from '../app-error';

export class DuplicateLeadError extends AppError {
  constructor(mobileNumber: string) {
    super(
      `A lead for mobile number ${mobileNumber} was already submitted within the last 7 days.`,
      409,
    );
    this.name = 'DuplicateLeadError';
  }
}

import { AppError } from '../app-error';

export type FieldError = {
  field: string;
  message: string;
};

export class ValidationError extends AppError {
  fieldErrors: FieldError[];

  constructor(fieldErrors: FieldError[]) {
    super('Validation failed', 400);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

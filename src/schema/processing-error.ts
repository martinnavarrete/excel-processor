import { Schema, model } from 'mongoose';

interface ProcessingError extends Document {
  column: string;
  row: number;
  message: string;
}

const processingErrorSchema = new Schema<ProcessingError>({
  column: {
    type: String,
  },
  row: {
    type: Number,
  },
  message: {
    type: String,
  },
});

const ProcessingErrorModel = model<ProcessingError>('ProcessingError', processingErrorSchema);

export { ProcessingError, ProcessingErrorModel };

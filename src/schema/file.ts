import mongoose, { Schema, model, ObjectId } from 'mongoose';
import { ProcessingErrorModel, ProcessingError } from './processing-error';

enum StatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
}

interface FileInfo extends Document {
  _id: ObjectId;
  status: StatusEnum;
  format: Map<string, ColumnFormat>;
  processingErrors: ProcessingError[];
  processedData: object[];
}

interface ColumnFormat {
  name: string;
  type: string;
}

const fileInfoSchema = new Schema<FileInfo>({
  status: {
    type: String,
    enum: Object.values(StatusEnum),
    default: StatusEnum.PENDING,
  },
  format: {
    type: Map,
    of: new Schema<ColumnFormat>({
      name: {
        type: String,
      },
      type: {
        type: String,
      },
    }),
  },
  processingErrors: {
    type: [ProcessingErrorModel.schema],
  },
  processedData: [mongoose.Schema.Types.Mixed],
});

const FileInfoModel = model<FileInfo>('FileInfo', fileInfoSchema);

export { FileInfoModel, FileInfo, StatusEnum };

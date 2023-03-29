import { FileInfo, FileInfoModel, StatusEnum } from '../schema/file';
import { ObjectId } from 'mongodb';
import PaginatedResult from '../utils/paginated-result';
import { ProcessingError } from '../schema/processing-error';

const saveFile = async (file: FileInfo): Promise<FileInfo> => {
  const fileInfo = new FileInfoModel(file);
  await fileInfo.save();
  return fileInfo;
};

const getFileById = async (fileId: string): Promise<FileInfo | null> => {
  const fileInfo = await FileInfoModel.findOne<FileInfo>({ _id: fileId });
  return fileInfo;
};

const getFileErrors = async (fileId: string, page: number, size: number): Promise<PaginatedResult<ProcessingError>> => {
  const data = await FileInfoModel.aggregate([
    { $match: { _id: new ObjectId(fileId) } },
    { $unwind: '$processingErrors' },
    { $skip: page * size },
    { $limit: size },
    { $project: { _id: 0, column: '$processingErrors.column', row: '$processingErrors.row', message: '$processingErrors.message' } },
  ]);

  const total = await FileInfoModel.aggregate([
    { $match: { _id: new ObjectId(fileId) } },
    { $unwind: '$processingErrors' },
    { $count: 'total' },
  ]);

  return {
    data,
    total: total[0].total,
    page,
    size,
  } as PaginatedResult<ProcessingError>;
};

const getFileProcessedData = async (fileId: string, page: number, size: number): Promise<PaginatedResult<object>> => {
  const elements = await FileInfoModel.aggregate([
    { $match: { _id: new ObjectId(fileId) } },
    { $unwind: '$processedData' },
    { $skip: page * size },
    { $limit: size },
    { $project: { _id: 0, data: '$processedData' } },
  ]);

  const total = await FileInfoModel.aggregate([
    { $match: { _id: new ObjectId(fileId) } },
    { $unwind: '$processedData' },
    { $count: 'total' },
  ]);

  const data = elements.map((element) => element.data);

  return {
    data,
    total: total[0].total,
    page,
    size,
  } as PaginatedResult<object>;
};

const updateFileStatus = async (fileId: string, status: StatusEnum): Promise<void> => {
  await FileInfoModel.updateOne({ _id: new ObjectId(fileId) }, { status: status });
};

const addProcessedRow = async (fileId: string, row: object): Promise<void> => {
  await FileInfoModel.updateOne({ _id: new ObjectId(fileId) }, { $push: { processedData: row } });
};

const addProcessingError = async (fileId: string, errorObj: ProcessingError): Promise<void> => {
  await FileInfoModel.updateOne({ _id: fileId }, { $push: { processingErrors: errorObj } });
};

export { saveFile, getFileById, getFileErrors, getFileProcessedData, updateFileStatus, addProcessedRow, addProcessingError };

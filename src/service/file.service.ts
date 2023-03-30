import ColumnFormatDto from '../dto/column-format.dto';
import { FileInfoModel, StatusEnum } from '../schema/file';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import FormatValidationError from '../errors/format-validation-error';
import ColumnHeaderInfo from '../utils/column-header-info';
import { ServiceError, ServiceErrorCode } from '../errors/service-error';
import { ProcessingError } from '../schema/processing-error';
import FileInfoResponseDto from '../dto/file-info.dto';
import PaginatedResponse from '../dto/paginated-response';
import ProcessingErrorResponseDto from '../dto/processing-error.dto';
import UploadedFileResponseDto from '../dto/uploaded-file.dto';
import {
  addProcessedRow,
  addProcessingError,
  getFileById,
  getFileErrors,
  getFileProcessedData,
  saveFile,
  updateFileStatus,
} from '../repository/file.repository';

const handleUploadedFile = async (file: string, csvFormat: Map<string, ColumnFormatDto>): Promise<UploadedFileResponseDto> => {
  const fileInfo = new FileInfoModel({
    format: csvFormat,
  });
  const savedFileInfo = await saveFile(fileInfo);
  const fileInfoId = savedFileInfo._id.toString();

  processFile(fileInfoId, file, csvFormat);

  return { id: fileInfoId } as UploadedFileResponseDto;
};

const getFileInfo = async (fileId: string): Promise<FileInfoResponseDto> => {
  const fileInfo = await getFileById(fileId);
  if (!fileInfo) {
    throw new ServiceError('File not found', ServiceErrorCode.NOT_FOUND);
  }
  return {
    id: fileId,
    status: fileInfo.status,
    errors: fileInfo.processingErrors.length,
  } as FileInfoResponseDto;
};

const getProcessingErrors = async (fileId: string, page: number, size: number): Promise<PaginatedResponse<ProcessingErrorResponseDto>> => {
  const result = await getFileErrors(fileId, page, size);

  if (result.total === 0) {
    const fileInfo = await getFileById(fileId);
    if (!fileInfo) {
      throw new ServiceError('File not found', ServiceErrorCode.NOT_FOUND);
    }
  }

  return {
    ...result,
    data: mapErrorToDto(result.data),
  } as PaginatedResponse<ProcessingErrorResponseDto>;
};

const getProcessedData = async (fileId: string, page: number, size: number): Promise<PaginatedResponse<object>> => {
  const result = await getFileProcessedData(fileId, page, size);

  if (result.total === 0) {
    const fileInfo = await getFileById(fileId);
    if (!fileInfo) {
      throw new ServiceError('File not found', ServiceErrorCode.NOT_FOUND);
    }
  }

  return {
    ...result,
  } as PaginatedResponse<object>;
};

const processFile = async (fileId: string, filePath: string, csvFormat: Map<string, ColumnFormatDto>): Promise<void> => {
  let rowNumber = 2;

  await updateFileStatus(fileId, StatusEnum.PROCESSING);

  const parser = parse({
    cast: true,
    relax_column_count: true,
  });
  parser.once('readable', () => {
    console.log('Starting to process file id: ' + fileId);
    parser.read();
  });
  parser.on('readable', async () => {
    let row;
    while ((row = parser.read())) {
      const myRowNumber = rowNumber++;
      try {
        const processedRow = processRow(row, csvFormat);
        await addProcessedRow(fileId, processedRow);
      } catch (error) {
        if (error instanceof FormatValidationError) {
          const errorObj = {
            column: error.column,
            row: myRowNumber,
            message: error.message,
          } as ProcessingError;
          await addProcessingError(fileId, errorObj);
        } else {
          console.error(error);
        }
      }
    }
  });
  parser.on('error', async (err: Error) => {
    console.error(err.message);
  });
  parser.on('end', async () => {
    await updateFileStatus(fileId, StatusEnum.DONE);
    console.log('Finished processing file id: ' + fileId);
  });

  fs.createReadStream(filePath).pipe(parser);
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const processRow = (row: any[], csvFormat: Map<string, ColumnFormatDto>): any => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processedRow: any = {};
  const orderedColumns = getOrderedColumns(csvFormat);
  if (row.length !== orderedColumns.length) {
    throw new FormatValidationError('Row length does not match expected format', '');
  }
  for (let i = 0; i < row.length; i++) {
    const value = row[i];
    const columnFormat = orderedColumns[i];
    const columnName = columnFormat.name;
    const columnType = columnFormat.type;
    if (!validateType(value, columnType)) {
      throw new FormatValidationError('Row value does not match expected type', columnFormat.column);
    }
    processedRow[columnName] = value;
  }
  return processedRow;
};

const getOrderedColumns = (csvFormat: Map<string, ColumnFormatDto>): ColumnHeaderInfo[] => {
  const orderedMap = new Map([...csvFormat.entries()].sort());
  const orderedColumns: ColumnHeaderInfo[] = [];
  for (const [key, value] of orderedMap.entries()) {
    orderedColumns.push({
      column: key,
      name: value.name,
      type: value.type,
    });
  }
  return orderedColumns;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateType = (variable: any, expectedType: string): boolean => {
  return typeof variable === expectedType;
};

const mapErrorToDto = (elements: ProcessingError[]): ProcessingErrorResponseDto[] => {
  return elements.map((element) => {
    return {
      column: element.column,
      row: element.row,
      message: element.message,
    };
  });
};

export { handleUploadedFile, getFileInfo, getProcessingErrors, getProcessedData };

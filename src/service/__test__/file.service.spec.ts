import { ObjectId } from 'mongodb';
import { ServiceError, ServiceErrorCode } from '../../errors/service-error';
import { getFileInfo, getProcessedData, getProcessingErrors } from '../file.service';

// Mocked MongoDB ObjectId
const objectId = new ObjectId();

// Mocked FileInfoModel
const mockedFileInfo = {
  _id: objectId,
  processingErrors: [
    {
      column: 'A',
      row: 2,
      message: 'Invalid value',
    },
    {
      column: 'B',
      row: 3,
      message: 'Missing required field',
    },
  ],
};

jest.mock('../../repository/file.repository', () => ({
  saveFile: jest.fn(),
  getFileById: jest.fn(),
  getFileErrors: jest.fn(),
  getFileProcessedData: jest.fn(),
  updateFileStatus: jest.fn(),
  addProcessingError: jest.fn(),
  addProcessedRow: jest.fn(),
}));

describe('getFileInfo', () => {
  const mockGetFileById = jest.requireMock('../../repository/file.repository').getFileById;

  it('should return file info when file is found', async () => {
    // Arrange
    const fileInfo = {
      _id: 'fileId',
      status: 'done',
      processingErrors: [],
    };
    mockGetFileById.mockResolvedValue(fileInfo);

    // Act
    const result = await getFileInfo('fileId');

    // Assert
    expect(result).toEqual({
      id: fileInfo._id,
      status: fileInfo.status,
      errors: fileInfo.processingErrors.length,
    });
    expect(mockGetFileById).toHaveBeenCalledWith('fileId');
  });

  it('should throw ServiceError with NOT_FOUND code when file is not found', async () => {
    // Arrange
    mockGetFileById.mockResolvedValue(null);

    // Act
    await expect(getFileInfo('fileId')).rejects.toThrow(new ServiceError('File not found', ServiceErrorCode.NOT_FOUND));

    // Assert
    expect(mockGetFileById).toHaveBeenCalledWith('fileId');
  });
});

describe('getProcessingErrors', () => {
  // Mock the getFileErrors && getFileById functions from the file.repository module
  const mockGetFileErrors = jest.requireMock('../../repository/file.repository').getFileErrors;
  const mockGetFileById = jest.requireMock('../../repository/file.repository').getFileById;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return processing errors with pagination', async () => {
    // Arrange
    mockGetFileErrors.mockResolvedValueOnce({
      data: [
        {
          column: 'A',
          row: 2,
          message: 'Invalid value',
        },
        {
          column: 'B',
          row: 3,
          message: 'Missing required field',
        },
      ],
      total: 2,
      page: 0,
      size: 10,
    });

    // Act
    const result = await getProcessingErrors(objectId.toString(), 0, 10);

    // Assert
    expect(mockGetFileErrors).toHaveBeenCalledTimes(1);
    expect(mockGetFileErrors).toHaveBeenCalledWith(objectId.toString(), 0, 10);

    expect(result).toEqual({
      data: [
        {
          column: 'A',
          row: 2,
          message: 'Invalid value',
        },
        {
          column: 'B',
          row: 3,
          message: 'Missing required field',
        },
      ],
      total: 2,
      page: 0,
      size: 10,
    });
  });

  it('should return empty array if there is no error but the file exists', async () => {
    // Arrange
    mockGetFileErrors.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
    mockGetFileById.mockResolvedValue(mockedFileInfo);

    // Act
    const result = await getProcessingErrors(objectId.toString(), 0, 10);

    // Assert
    expect(mockGetFileErrors).toHaveBeenCalledTimes(1);
    expect(mockGetFileErrors).toHaveBeenCalledWith(objectId.toString(), 0, 10);
    expect(mockGetFileById).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
  });

  it('should throw ServiceError with NOT_FOUND code when file is not found', async () => {
    // Arrange
    mockGetFileErrors.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
    mockGetFileById.mockResolvedValue(null);

    // Act & Assert
    await expect(getProcessingErrors(objectId.toString(), 0, 10)).rejects.toThrow(
      new ServiceError('File not found', ServiceErrorCode.NOT_FOUND),
    );
  });
});

describe('getFileProcessedData', () => {
  // Mock the getFileProcessedData && getFileById functions from the file.repository module
  const mockGetFileProcessedData = jest.requireMock('../../repository/file.repository').getFileProcessedData;
  const mockGetFileById = jest.requireMock('../../repository/file.repository').getFileById;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return processed data with pagination', async () => {
    // Arrange
    mockGetFileProcessedData.mockResolvedValueOnce({
      data: [
        {
          _id: 'A',
          total: 2,
        },
        {
          _id: 'B',
          total: 3,
        },
      ],
      total: 2,
      page: 0,
      size: 10,
    });

    // Act
    const result = await getProcessedData(objectId.toString(), 0, 10);

    // Assert
    expect(mockGetFileProcessedData).toHaveBeenCalledTimes(1);
    expect(mockGetFileProcessedData).toHaveBeenCalledWith(objectId.toString(), 0, 10);

    expect(result).toEqual({
      data: [
        {
          _id: 'A',
          total: 2,
        },
        {
          _id: 'B',
          total: 3,
        },
      ],
      total: 2,
      page: 0,
      size: 10,
    });
  });

  it('should return empty array if there is no data but the file exists', async () => {
    // Arrange
    mockGetFileProcessedData.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
    mockGetFileById.mockResolvedValue(mockedFileInfo);

    // Act
    const result = await getProcessedData(objectId.toString(), 0, 10);

    // Assert
    expect(mockGetFileProcessedData).toHaveBeenCalledTimes(1);
    expect(mockGetFileProcessedData).toHaveBeenCalledWith(objectId.toString(), 0, 10);
    expect(mockGetFileById).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
  });

  it('should throw ServiceError with NOT_FOUND code when file is not found', async () => {
    // Arrange
    mockGetFileProcessedData.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 0,
      size: 10,
    });
    mockGetFileById.mockResolvedValue(null);

    // Act & Assert
    await expect(getProcessedData(objectId.toString(), 0, 10)).rejects.toThrow(
      new ServiceError('File not found', ServiceErrorCode.NOT_FOUND),
    );
  });
});

//  describe('handleUploadedFile', () => {

//   // Mock the saveFile, updateFileStatus, addProcessedRow & addProcessingError functions from the file.repository module
//   const mockSaveFile = jest.requireMock('../../repository/file.repository').saveFile;
//   const mockUpdateFileStatus = jest.requireMock('../../repository/file.repository').updateFileStatus;
//   const mockAddProcessedRow = jest.requireMock('../../repository/file.repository').addProcessedRow;
//   const mockAddProcessingError = jest.requireMock('../../repository/file.repository').addProcessingError;

//   const csvFormat = new Map<string, ColumnFormatDto>([
//     ['A', { name: "name", type: "string" }],
//     ['B', { name: "age", type: "number" }],
//   ]);

//   const multerFile = {
//     path: 'resources/testFiles/name-age-invalid-row.csv',
//     originalname: 'file.csv',
//     mimetype: 'text/csv',
//   };

//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   it('should process the file and save the result to the database', async () => {
//     // Arrange
//     const mockedProcessFile = jest.requireMock('../file.service').processFile;
//     mockSaveFile.mockResolvedValueOnce(mockedFileInfo);
//     mockedProcessFile.mockResolvedValueOnce();

//     // Act
//     const result = await handleUploadedFile(multerFile, csvFormat);

//     // Assert
//     expect(result).toEqual(mockedFileInfo);
//     expect(mockSaveFile).toHaveBeenCalledTimes(1);
//     expect(mockSaveFile).toHaveBeenCalledWith(multerFile.originalname, multerFile.mimetype);
//     expect(mockUpdateFileStatus).toHaveBeenCalledTimes(1);

//   });
//  });

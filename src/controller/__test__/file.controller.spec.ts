/*eslint-disable*/
import { ServiceError, ServiceErrorCode } from '../../errors/service-error';
import { getFileErrors, getFileProcessedData, getFileStatus, uploadFile } from '../file.controller';

jest.mock('../../service/file.service', () => ({
  getFileInfo: jest.fn(),
  getProcessingErrors: jest.fn(),
  getProcessedData: jest.fn(),
  handleUploadedFile: jest.fn(),
}));

describe('getFileStatus', () => {
  // Mock the getFileInfo function from the file service
  const getFileInfo = jest.requireMock('../../service/file.service').getFileInfo;

  it('should return a 400 error if no file id is provided', async () => {
    // Arrange
    const req = { params: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await getFileStatus(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must provide the id of the file in the path');
  });

  it('should return a 404 error if the file id is not found', async () => {
    // Arrange
    const req = { params: { id: 'nonexistent-file-id' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getFileInfo.mockRejectedValue(new ServiceError('File not found', ServiceErrorCode.NOT_FOUND));

    // Act
    await getFileStatus(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('File not found');
  });

  it('should return a 400 error if there is a general service error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getFileInfo.mockRejectedValue(new ServiceError('Service error occurred', ServiceErrorCode.OTHER));

    // Act
    await getFileStatus(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Service error occurred');
  });

  it('should return a 500 error if there is an unexpected error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getFileInfo.mockRejectedValue(new Error('Unexpected error occurred'));

    // Act
    await getFileStatus(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal server error');
  });

  it('should return the file information if it exists', async () => {
    // Arrange
    const fileInfo = { fileId: 'file-id', fileName: 'file.csv', fileSize: 100, processed: true };
    const req = { params: { id: 'file-id' } };
    const res = { send: jest.fn() };
    getFileInfo.mockResolvedValue(fileInfo);

    // Act
    await getFileStatus(req as any, res as any);

    // Assert
    expect(res.send).toHaveBeenCalledWith(fileInfo);
  });
});

describe('getFileErrors', () => {
  // Mock the getProcessingErrors function from the file service
  const getProcessingErrors = jest.requireMock('../../service/file.service').getProcessingErrors;

  it('should return a 400 error if no file id is provided', async () => {
    // Arrange
    const req = { params: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must provide the id of the file in the path');
  });

  it('should return a 400 error if page and size are missing', async () => {
    // Arrange
    const req = { params: { id: 'nonexistent-file-id' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must provide the page and size of the file in the query string');
  });

  it('should return a 404 error if the file id is not found', async () => {
    // Arrange
    const req = { params: { id: 'nonexistent-file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessingErrors.mockRejectedValue(new ServiceError('File not found', ServiceErrorCode.NOT_FOUND));

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('File not found');
  });

  it('should return a 400 error if there is a general service error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessingErrors.mockRejectedValue(new ServiceError('Service error occurred', ServiceErrorCode.OTHER));

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Service error occurred');
  });

  it('should return a 500 error if there is an unexpected error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessingErrors.mockRejectedValue(new Error('Unexpected error occurred'));

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal server error');
  });

  it('should return the file errors if they exist', async () => {
    // Arrange
    const fileErrors = {
      data: [
        { row: 1, column: 'A', message: 'Error 1' },
        { row: 2, column: 'A', message: 'Error 2' },
      ],
      total: 2,
      page: 1,
      size: 10,
    };
    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { send: jest.fn() };
    getProcessingErrors.mockResolvedValue(fileErrors);

    // Act
    await getFileErrors(req as any, res as any);

    // Assert
    expect(res.send).toHaveBeenCalledWith(fileErrors);
  });
});

describe('getFileProcessedData', () => {
  // Mock the getFileProcessedData function from the file service
  const getProcessedData = jest.requireMock('../../service/file.service').getProcessedData;

  it('should return a 400 error if no file id is provided', async () => {
    // Arrange
    const req = { params: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must provide the id of the file in the path');
  });

  it('should return a 400 error if page and size are missing', async () => {
    // Arrange
    const req = { params: { id: 'nonexistent-file-id' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must provide the page and size of the file in the query string');
  });

  it('should return a 404 error if the file id is not found', async () => {
    // Arrange
    const req = { params: { id: 'nonexistent-file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessedData.mockRejectedValue(new ServiceError('File not found', ServiceErrorCode.NOT_FOUND));

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('File not found');
  });

  it('should return a 400 error if there is a general service error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessedData.mockRejectedValue(new ServiceError('Service error occurred', ServiceErrorCode.OTHER));

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.send).toHaveBeenCalledWith('Service error occurred');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return a 500 error if there is an unexpected error', async () => {
    // Arrange
    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    getProcessedData.mockRejectedValue(new Error('Unexpected error occurred'));

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal server error');
  });

  it('should return the file data if it exists', async () => {
    // Arrange
    const fileData = {
      data: [
        { id: '1', name: 'Name 1', email: 'mail1@mail.com' },
        { id: '2', name: 'Name 2', email: 'mail2@mail.com' },
      ],
      total: 2,
      page: 1,
      size: 10,
    };

    const req = { params: { id: 'file-id' }, query: { page: 1, size: 10 } };
    const res = { send: jest.fn() };
    getProcessedData.mockResolvedValue(fileData);

    // Act
    await getFileProcessedData(req as any, res as any);

    // Assert
    expect(res.send).toHaveBeenCalledWith(fileData);
  });
});

describe('uploadFile', () => {
  // Mock the handleUploadedFile file function from the file service
  const handleUploadedFile = jest.requireMock('../../service/file.service').handleUploadedFile;

  it('should return a 400 error if no file is uploaded', async () => {
    // Arrange
    const req = { file: null } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await uploadFile(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Must upload a file with the key 'file'");
  });

  it('should return a 400 error if the file is not a CSV file', async () => {
    // Arrange
    const req = {
      file: { mimetype: 'application/json' },
      query: { expectedFormat: '{"A": {"name": "name", "type": "string"}, "B": {"name": "age", "type": "number"}}' },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // Act
    await uploadFile(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Must upload a CSV file');
  });

  it('should return a 500 error if there is an unexpected error', async () => {
    // Arrange
    const req = {
      file: { mimetype: 'text/csv' },
      query: { expectedFormat: '{"A": {"name": "name", "type": "string"}, "B": {"name": "age", "type": "number"}}' },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    handleUploadedFile.mockRejectedValue(new Error('Unexpected error occurred'));

    // Act
    await uploadFile(req as any, res as any);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal server error');
  });

  it('should return the file id if the file is uploaded successfully', async () => {
    // Arrange
    const req = {
      file: { mimetype: 'text/csv' },
      query: { expectedFormat: '{"A": {"name": "name", "type": "string"}, "B": {"name": "age", "type": "number"}}' },
    };
    const res = { send: jest.fn() };
    handleUploadedFile.mockResolvedValue({ id: 'file-id' });

    // Act
    await uploadFile(req as any, res as any);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ id: 'file-id' });
  });
});

import { Request, Response } from 'express';
import ColumnFormatDto from '../dto/column-format.dto';
import { ServiceError, ServiceErrorCode } from '../errors/service-error';
import { handleUploadedFile, getFileInfo, getProcessingErrors, getProcessedData } from '../service/file.service';

const uploadFile = async (req: Request, res: Response) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).send("Must upload a file with the key 'file'");
    }
    if (file.mimetype !== 'text/csv') {
      return res.status(400).send('Must upload a CSV file');
    }

    const expectedFormatParam = req.query?.expectedFormat as string;
    if (!expectedFormatParam) {
      return res.status(400).send("Must provide the expected format of the file in the query string with the key 'expectedFormat'");
    }
    let expectedFormat: Map<string, ColumnFormatDto>;
    try {
      const expectedFormatJson = JSON.parse(expectedFormatParam);
      expectedFormat = new Map<string, ColumnFormatDto>(Object.entries(expectedFormatJson));
    } catch (error) {
      console.error(error);
      return res.status(400).send('The expected format must be a valid JSON object!');
    }

    const response = await handleUploadedFile(file.path, expectedFormat);

    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
};

const getFileStatus = async (req: Request, res: Response) => {
  const fileId = req.params.id;
  if (!fileId) {
    return res.status(400).send('Must provide the id of the file in the path');
  }
  try {
    const response = await getFileInfo(fileId);
    res.send(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      if (error.code === ServiceErrorCode.NOT_FOUND) {
        return res.status(404).send(error.message);
      }
      return res.status(400).send(error.message);
    }
    console.log('Error: ' + error);
    res.status(500).send('Internal server error');
  }
};

const getFileErrors = async (req: Request, res: Response) => {
  if (!req.params?.id) {
    return res.status(400).send('Must provide the id of the file in the path');
  }
  const fileId = req.params.id;

  if (!req.query?.page || !req.query?.size) {
    return res.status(400).send('Must provide the page and size of the file in the query string');
  }
  const page = +(req.query.page as string);
  const size = +(req.query.size as string);

  if (!validatePaginationParams(page, size)) {
    return res.status(400).send('The page and size must be positive numbers');
  }

  try {
    const response = await getProcessingErrors(fileId, page, size);
    res.send(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      if (error.code === ServiceErrorCode.NOT_FOUND) {
        return res.status(404).send(error.message);
      }
      return res.status(400).send(error.message);
    }
    console.log('Error: ' + error);
    res.status(500).send('Internal server error');
  }
};

const getFileProcessedData = async (req: Request, res: Response) => {
  if (!req.params?.id) {
    return res.status(400).send('Must provide the id of the file in the path');
  }
  const fileId = req.params.id;

  if (!req.query?.page || !req.query?.size) {
    return res.status(400).send('Must provide the page and size of the file in the query string');
  }
  const page = +(req.query.page as string);
  const size = +(req.query.size as string);

  if (!validatePaginationParams(page, size)) {
    return res.status(400).send('The page and size must be positive numbers');
  }

  try {
    const response = await getProcessedData(fileId, page, size);
    res.send(response);
  } catch (error) {
    if (error instanceof ServiceError) {
      if (error.code === ServiceErrorCode.NOT_FOUND) {
        return res.status(404).send(error.message);
      }
      return res.status(400).send(error.message);
    }
    console.log(error);
    res.status(500).send('Internal server error');
  }
};

const validatePaginationParams = (page: number, size: number): boolean => {
  return page >= 0 && size > 0;
};

export { uploadFile, getFileStatus, getFileErrors, getFileProcessedData };

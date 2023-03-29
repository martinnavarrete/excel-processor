import { Express } from 'express';
import { getFileErrors, getFileProcessedData, getFileStatus, uploadFile } from './controller/file.controller';
import multer from 'multer';

const upload = multer({ dest: 'tmp/uploads/' }).single('file');

// TODO: openAPI documentation
export function routes(app: Express) {
  app.post('/files', (req, res) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send("Must upload a file with the key 'file'");
      } else if (err) {
        return res.status(500).send('Internal server error');
      }
      return uploadFile(req, res);
    });
  });
  app.get('/files/:id', getFileStatus);
  app.get('/files/:id/errors', getFileErrors);
  app.get('/files/:id/processed-data', getFileProcessedData);
}

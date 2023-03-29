import { Request, Response, NextFunction } from 'express';

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;

  // TODO: Add a better auth mechanism, this is just for demo purposes
  if (!auth || auth !== 'Bearer 123') {
    return res.status(401).send('Unauthorized');
  }
  next();
};

export default isAuth;

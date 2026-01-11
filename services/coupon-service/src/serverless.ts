import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import couponRoutes from './routes/couponRoutes';
import { DEFAULT_CORS_ORIGINS } from '@3asoftwares/utils';
import { Logger } from '@3asoftwares/utils/server';

// Configure logger for coupon service
Logger.configure({
  enableConsole: true,
  enableFile: false,
  logLevel: process.env.LOG_LEVEL || 'info',
});

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || DEFAULT_CORS_ORIGINS,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Coupon service is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/coupons', couponRoutes);

app.use((req: Request, res: Response) => {
  Logger.warn(`Route not found: ${req.method} ${req.path}`, undefined, 'Router');
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

app.use((err: any, req: Request, res: Response, _next: any) => {
  Logger.error(
    `Unhandled error: ${err.message}`,
    { stack: err.stack, path: req.path, method: req.method },
    'ErrorHandler'
  );
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Database connection state
let isConnected = false;

// Serverless handler
const handler = async (req: any, res: any) => {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
  return app(req, res);
};

export default handler;

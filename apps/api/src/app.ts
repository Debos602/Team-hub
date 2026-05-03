import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import config from './config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app: Application = express();
app.use(cookieParser());

app.use(cors({
    origin: [`${config.frontendUrl}`],
    credentials: true
}));

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.get('/', (req: Request, res: Response) => {
    res.send({
        Message: "Team Hub Server is running.."
    });
});

app.use('/api/v1', router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!"
        }
    });
});

export default app;
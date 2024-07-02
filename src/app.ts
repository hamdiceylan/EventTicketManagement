import express from 'express';
import bodyParser from 'body-parser';
import eventRoutes from './interfaces/http/routes/eventRoutes';
import './infrastructure/database/redisClient'; // Import to initialize Redis clients and keyspace notifications
import config from './config';
import setupSwagger from './interfaces/swagger';

const app = express();
app.use(bodyParser.json());

app.use('/api/v1/events', eventRoutes);

setupSwagger(app);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
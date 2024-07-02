import swaggerUi, { JsonObject } from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import { Application } from 'express';

const swaggerDocument: JsonObject = yaml.load(fs.readFileSync('openapi.yaml', 'utf8')) as JsonObject;

const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;

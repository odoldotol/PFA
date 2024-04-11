import { INestApplication } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { openApiConfig } from "src/config";

export default (app: INestApplication) => {
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, openApiConfig)
  );
};
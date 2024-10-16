import { DocumentBuilder } from "@nestjs/swagger";

export const openApiConfig = new DocumentBuilder()
  .setTitle('LAPIKI Market API')
  .setVersion('1.0')
  .setDescription('Market Data')
  .setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
  .addTag('Exchange')
  .addTag('Asset')
  .addTag('Development')
  .build();
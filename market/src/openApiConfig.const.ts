import { DocumentBuilder } from "@nestjs/swagger";

export const config = new DocumentBuilder()
  .setTitle('LAPIKI Market API')
  .setVersion('1.0')
  .setDescription('Market Data')
  .setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
  .addTag('App', 'default')
  .addTag('Updater')
  .addTag('Config')
  .addTag('Development')
  .build();
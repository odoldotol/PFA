// Todo: 안으로 넣어

import { DocumentBuilder } from "@nestjs/swagger";

export const config = new DocumentBuilder()
  .setTitle('LAPIKI Market API')
  .setVersion('1.0')
  .setDescription('Market Data')
  .setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
  .addTag('Asset')
  .addTag('Updater')
  .addTag('Development')
  .build();
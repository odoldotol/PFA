import { DocumentBuilder } from "@nestjs/swagger";

export const openApiConfig = new DocumentBuilder()
.setTitle('LAPIKI Product API')
.setVersion('1.0')
.setDescription('Product')
.setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
.addTag('App')
.addTag('Kakao Chatbot')
.addTag('Market')
.addTag('Development')
.build();
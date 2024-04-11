import { ConfigModuleOptions } from '@nestjs/config';

const options: ConfigModuleOptions = {
  envFilePath: ".env.product",
};

export default options;
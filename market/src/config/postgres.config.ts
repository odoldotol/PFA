import { EnvKey } from 'src/common/enum/envKey.enum';
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import typeOrmModuleOptions from './const/typeOrmModuleOptions.const';

export default (): ConfigPostgres => ({
  [EnvKey.TYPEORM_MODULE_OPTIONS]: typeOrmModuleOptions,
});

interface ConfigPostgres extends Pick<EnvironmentVariables, EnvKey.TYPEORM_MODULE_OPTIONS> {};

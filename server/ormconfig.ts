import * as dotenv from 'dotenv';
import './src/boilerplate.polyfill';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';
import { subscribers } from './src/entity-subscribers';

if (!(module as any).hot /* for webpack HMR */) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

dotenv.config({
  path: `.${process.env.NODE_ENV}.env`,
});

// Replace \\n with \n to support multiline strings in AWS
for (const envName of Object.keys(process.env)) {
  process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
}

module.exports = {
  type: 'mysql', // mysql,postgres
  host: process.env.MYSQL_HOST,
  port: +process.env.MYSQL_PORT,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: subscribers,
  entities: ['src/features/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
};

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => require('gsa.json')], // Replace with the path to your service account JSON file
    }),
  ],
  controllers: [AppController],
  providers: [RoleGuard],
})
export class AppModule {}
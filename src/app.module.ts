import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ serviceAccountEmail: 'xxx.iam.gserviceaccount.com' })], // Replace with your service account email
    }),
  ],
  controllers: [AppController],
  providers: [RoleGuard],
})
export class AppModule {}
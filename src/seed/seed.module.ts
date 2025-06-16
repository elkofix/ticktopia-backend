import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../event/event.module';
import { PresentationModule } from '../presentation/presentation.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  controllers: [SeedController],
  imports: [AuthModule, EventModule, PresentationModule, TicketModule]
})
export class SeedModule {}

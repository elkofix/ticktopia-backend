import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  controllers: [WebhookController],
  imports: [TicketModule]
})
export class WebhookModule {}

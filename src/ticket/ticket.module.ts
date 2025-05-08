import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Presentation } from '../presentation/entities/presentation.entity';
import { Ticket } from './entities/ticket.entity';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [TypeOrmModule.forFeature([User, Presentation, Ticket]),
  ]
})
export class TicketModule { }

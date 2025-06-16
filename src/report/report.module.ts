import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { EventModule } from 'src/event/event.module';
import { PresentationModule } from 'src/presentation/presentation.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../ticket/entities/ticket.entity';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [TypeOrmModule.forFeature([Ticket]), PdfModule]
})
export class ReportModule {}

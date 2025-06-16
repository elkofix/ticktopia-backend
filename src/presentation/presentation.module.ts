import { Module } from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PresentationController } from './presentation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presentation } from './entities/presentation.entity';
import { Event } from '../event/entities/event.entity';
import { EventModule } from 'src/event/event.module';

@Module({
  controllers: [PresentationController],
  providers: [PresentationService],
  imports: [TypeOrmModule.forFeature([Presentation, Event]), EventModule
  ],
  exports: [PresentationService]
})
export class PresentationModule { }

import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { Event } from './entities/event.entity';
import { EventResolver } from './event.controller';
import { Presentation } from 'src/presentation/entities/presentation.entity';

@Module({
  providers: [EventResolver,EventService],
  exports: [EventService],
  imports: [PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([Presentation,  Event , User]),
    AuthModule
  ]
})
export class EventModule {}
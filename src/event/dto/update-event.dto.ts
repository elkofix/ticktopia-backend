import { InputType, PartialType } from '@nestjs/graphql';
import { CreateEventDto } from './create-event.dto';

@InputType()
export class UpdateEventDto extends PartialType(CreateEventDto) {}

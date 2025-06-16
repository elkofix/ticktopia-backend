import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTicketDto {

  @ApiProperty({
    example: '5f6d3f57-1dd3-41fd-a7a7-010203040506',
    description: 'ID of the user who owns the ticket',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '7d2e6c84-4dd3-44b8-b0a7-908080808080',
    description: 'ID of the associated presentation',
  })
  @IsUUID()
  @IsNotEmpty()
  presentationId: string;
}

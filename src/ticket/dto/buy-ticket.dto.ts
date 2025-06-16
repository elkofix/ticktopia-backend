import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class BuyTicketDto {
  @ApiProperty({
    example: '8c9a1d12-aaaa-4bbf-ccdd-eeeeeeeeeeee',
    description: 'UUID of the presentation to buy a ticket for',
  })
  @IsUUID()
  presentationId: string;

  @ApiProperty({
    example: 2,
    description: 'Number of tickets to buy',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

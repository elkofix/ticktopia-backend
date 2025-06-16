import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Mark the ticket as redeemed (used to enter the event)',
  })
  @IsOptional()
  @IsBoolean()
  isRedeemed?: boolean;
}

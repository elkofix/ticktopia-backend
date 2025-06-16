import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';


export class CreateCheckoutSessionDto {

  @ApiProperty({
    example: 2,
    description: 'Number of tickets to buy',
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: '7d2e6c84-4dd3-44b8-b0a7-908080808080',
    description: 'ID of the buyer',
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

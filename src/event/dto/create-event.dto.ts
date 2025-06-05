import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateEventDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  bannerPhotoUrl: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
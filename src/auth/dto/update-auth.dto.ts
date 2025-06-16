import { InputType, PartialType, Field } from '@nestjs/graphql';
import { CreateAuthDto } from './create-auth.dto';
import { Exclude } from 'class-transformer';

@InputType()
export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @Exclude()
  password: string;
}
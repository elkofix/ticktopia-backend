// auth/dto/login-response.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from './user.dto';

@ObjectType()
export class LoginResponseDto {
  @Field(() => String)
  token: string;

  @Field(() => UserDto)
  user: UserDto;
}

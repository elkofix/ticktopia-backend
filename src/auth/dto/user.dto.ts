import { ObjectType, Field } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';

@ObjectType()
export class UserDto {

  
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Exclude()
  password: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  lastname: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [String])
  roles: string[];
  constructor(partial?: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
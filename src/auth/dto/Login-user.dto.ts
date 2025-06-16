import { Field, InputType } from "@nestjs/graphql";
import { IsString, IsEmail, MaxLength, MinLength } from "class-validator";

@InputType()
export class LoginUserDto {
  @Field(() => String, { description: 'A valid email' })
  @IsString()
  @IsEmail()
  email: string;
  
  @Field(() => String)
  @IsString()
  password: string;
}
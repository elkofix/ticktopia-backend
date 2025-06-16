import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateAuthDto {
  @Field(() => String, { description: 'A valid email (unique)' })
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String, { 
    description: 'The password must have a Uppercase, lowercase letter and a number' 
  })
  @IsString()
  @MaxLength(50)
  @MinLength(6)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  lastname: string;
}
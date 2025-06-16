import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class FindOneUserDto {
  @Field(() => String, { description: 'A valid uuid' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
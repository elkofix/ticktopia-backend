import { Field, InputType } from "@nestjs/graphql";
import { ValidRoles } from "../enums/valid-roles.enum";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from "class-validator";

@InputType()
export class UpdateRoleDto {
  @Field(() => [ValidRoles], { 
    description: 'List of roles that we want to set to a user' 
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  roles: ValidRoles[];
}
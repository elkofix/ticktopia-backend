import { Exclude } from 'class-transformer';

export class UserDtos {

  @Exclude()
  password: string;

  constructor(partial: Partial<UserDtos>) {
    Object.assign(this, partial);
  }
}
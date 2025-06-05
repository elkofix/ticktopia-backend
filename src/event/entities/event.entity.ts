import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from "typeorm";
import { Ticket } from "../../ticket/entities/ticket.entity";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../auth/entities/user.entity";
import { Presentation } from "../../presentation/entities/presentation.entity";

@ObjectType()
@Entity()
export class Event {
  @Field(() => ID)
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Event ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @ApiProperty()
  @Column('text')
  name: string;

  @Field({ nullable: true })
  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255 })
  bannerPhotoUrl: string;

  @Field()
  @ApiProperty()
  @Column({ type: 'boolean' })
  isPublic: boolean;

  @Field(() => User)
  @ManyToOne(() => User, user => user.events, { onDelete: 'CASCADE', cascade: true, eager: true, nullable: false })
  @JoinColumn({ name: 'User_idUser' })
  user: User;

  @Field(() => [Presentation], { nullable: true })
  @OneToMany(() => Presentation, presentation => presentation.event)
  presentations: Presentation[];

  checkFieldsBeforeInsert() {
    if (this.name) this.name = this.name.trim();
    if (this.bannerPhotoUrl) this.bannerPhotoUrl = this.bannerPhotoUrl.trim().toLowerCase();
  }

  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
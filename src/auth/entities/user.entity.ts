import { ObjectType, Field } from "@nestjs/graphql";
import { Exclude } from "class-transformer";
import { Event } from "../../event/entities/event.entity";
import { Ticket } from "../../ticket/entities/ticket.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity('users')
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column('text', { unique: true })
  email: string;

  @Exclude()
  @Column('text', { select: false })
  password?: string;

  @Field(() => String)
  @Column('text')
  name: string;

  @Field(() => String)
  @Column('text')
  lastname: string;

  @Field(() => Boolean)
  @Column('bool', { default: true })
  isActive: boolean;

  @Field(() => [Event])
  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @Field(() => [Ticket])
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @Field(() => [String])
  @Column('text', { array: true, default: ['client'] })
  roles: string[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
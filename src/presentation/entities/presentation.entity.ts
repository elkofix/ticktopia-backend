import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from "@nestjs/swagger";
import { Event } from "../../event/entities/event.entity";
import { Ticket } from "../../ticket/entities/ticket.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Presentation {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    idPresentation: string;

    @Field()
    @ApiProperty({
        example: 'Atanasio Giradot',
        description: 'Name of the place where event is placed',
    })
    @Column('text')
    place: string;

    @Field(() => Event)
    @ManyToOne(
        () => Event,
        (event) => event.presentations,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'eventId' })
    event: Event;

    @Field(() => Int)
    @ApiProperty({
        description: 'Capacity of this presentation',
        example: 500
    })
    @Column({ type: 'int' })
    capacity: number;

    @Field(() => Float)
    @Column({ type: 'float' })
    price: number;

    @Field()
    @Column({ type: 'timestamp' })
    openDate: Date;

    @Field()
    @Column({ type: 'timestamp' })
    startDate: Date;

    @Field(() => Float)
    @Column({ type: 'float' })
    latitude: number;

    @Field(() => Float)
    @Column({ type: 'float' })
    longitude: number;

    @Field()
    @Column('text')
    description: string;

    @Field()
    @Column({ type: 'timestamp' })
    ticketAvailabilityDate: Date;

    @Field()
    @Column({ type: 'timestamp' })
    ticketSaleAvailabilityDate: Date;

    @Field()
    @Column('text')
    city: string;

    @Field(() => [Ticket], { nullable: true })
    @OneToMany(() => Ticket, (ticket) => ticket.presentation)
    tickets: Ticket[];
}
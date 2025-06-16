import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../auth/entities/user.entity";
import { Presentation } from "../../presentation/entities/presentation.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Ticket {
    @Field(() => ID)
    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'Ticket ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ type: 'timestamp' })
    buyDate: Date;

    @Field()
    @Column({ type: 'boolean' })
    isRedeemed: boolean;

    @Field()
    @Column({ type: 'boolean' })
    isActive: boolean;

    @Field(() => Int)
    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Field(() => User)
    @ManyToOne(
        () => User,
        user => user.tickets,
        { onDelete: 'CASCADE' })
    user: User;

    @Field(() => Presentation)
    @ManyToOne(
        () => Presentation,
        (presentation) => presentation.tickets,
        { cascade: true, eager: true, nullable: false }
    )
    presentation: Presentation;
}
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from '../auth/entities/user.entity';
import { Presentation } from '../presentation/entities/presentation.entity';
import axios from 'axios';
import * as qs from 'qs';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { addHours, isAfter, isBefore } from 'date-fns';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Presentation) private presentationRepo: Repository<Presentation>,
  ) { }

  async create(dto: CreateTicketDto & { isRedeemed?: boolean, isActive?: boolean }) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const presentation = await this.presentationRepo.findOne({ where: { idPresentation: dto.presentationId } });

    if (!user || !presentation) {
      throw new NotFoundException('User or Presentation not found');
    }

    const ticket = this.ticketRepo.create({
      buyDate: new Date(),
      isRedeemed: dto.isRedeemed ?? false,
      isActive: dto.isActive ?? false,
      user,
      presentation,
    });

    return this.ticketRepo.save(ticket);
  }

  async createCheckoutSession(quantity: number, ticketIds: string[], user: User, presentation: Presentation) {
    const data = {
      'line_items[0][quantity]': quantity,
      'line_items[0][price_data][currency]': 'cop',
      'line_items[0][price_data][product_data][name]': presentation.event.name,
      'line_items[0][price_data][unit_amount]': presentation.price * 100,
      'payment_method_types[0]': 'card',
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/buy/success`,
      cancel_url: `${process.env.FRONTEND_URL}/buy/${presentation.idPresentation}`,
      'metadata[userId]': user.id,
      'metadata[ticketIds]': JSON.stringify(ticketIds), // ← Aquí serializas el array

    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    };

    try {
      const response: { data: { url: string } } = await axios.post(
        'https://api.stripe.com/v1/checkout/sessions',
        qs.stringify(data),
        { headers },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session', error);
      throw error;
    }
  }

  findAll(user: User) {
    return this.ticketRepo.find({ where: { user: user, isActive: true, isRedeemed: false } });
  }

  findAllHistoric(user: User) {
    return this.ticketRepo.find({ where: { user: user, isActive: true, isRedeemed: true } });
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto & { isActive?: boolean }) {
    const foundTicket = await this.findOne(id);
    if (!foundTicket) {
      throw new NotFoundException("Ticket not found");
    }

    const now = new Date();
    const openDate = new Date(foundTicket.presentation.openDate);
    const startDate = new Date(foundTicket.presentation.startDate);
    const fiveHoursAfterStart = addHours(startDate, 5);

    if (dto.isRedeemed) {
      if (!foundTicket.isActive) {
        throw new BadRequestException("Cannot redeem inactive ticket");
      }
      console.log(now);
      console.log(openDate)
      if (isBefore(now, openDate)) {
        throw new BadRequestException("Cannot redeem ticket before doors open");
      }

      if (isAfter(now, fiveHoursAfterStart)) {
        throw new BadRequestException("Cannot redeem ticket after 5 hours of concert start");
      }
    }

    if (foundTicket.isRedeemed) {
      throw new BadRequestException("Cannot update already redeemed ticket");
    }

    const ticket = await this.ticketRepo.preload({ id, ...dto });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.ticketRepo.save(ticket);
  }


  async deleteAll() {
    await this.ticketRepo.delete({});
  }

  async remove(id: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.ticketRepo.remove(ticket);
  }
  async buyTicket(userId: string, buyDto: BuyTicketDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const presentation = await this.presentationRepo.findOne({
      where: { idPresentation: buyDto.presentationId },
    });

    if (!user || !presentation) {
      throw new NotFoundException('User or Presentation not found');
    }

    const sold = await this.ticketRepo.count({
      where: {
        presentation: { idPresentation: presentation.idPresentation },
        isActive: true,
      },
    });

    if (sold + buyDto.quantity > presentation.capacity) {
      throw new BadRequestException('Not enough tickets available');
    }
    const tickets = Array.from({ length: buyDto.quantity }, () =>
      this.ticketRepo.create({
        user,
        presentation,
        buyDate: new Date(),
        isActive: false,
        isRedeemed: false,
        quantity: 1, // cada ticket representa 1 entrada
      })
    );
    const savedTickets = await this.ticketRepo.save(tickets);
    const savedTicketsIds = savedTickets.map((ticket) => ticket.id);
    return { ...savedTickets, checkoutSession: (await this.createCheckoutSession(buyDto.quantity, savedTicketsIds, user, presentation)).url };
  }

}

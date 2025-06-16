import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../../../src/auth/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ValidRoles } from '../../../src/auth/enums/valid-roles.enum';
import { Event } from '../../../src/event/entities/event.entity';
import { Presentation } from '../../../src/presentation/entities/presentation.entity';
import { Ticket } from '../../../src/ticket/entities/ticket.entity';

function generateRandomEmail(prefix: string = 'admin'): string {
  const randomString = Math.random().toString(36).substring(2, 10); // genera 8 caracteres aleatorios
  return `${prefix}${randomString}@test.com`;
}

const UserTest = {
  email: generateRandomEmail(),
  password: 'Hola1597!!!',
  name: 'Update',
  lastname: 'Admin',
};

const UserTestManager = {
  email: generateRandomEmail(),
  password: 'Hola1597!!!',
  name: 'Update',
  lastname: 'Admin',
};

const UserTestManager2 = {
  email: generateRandomEmail(),
  password: 'Hola1597!!!',
  name: 'Update',
  lastname: 'Admin',
};
const EventTest = {
  name: "TesEvnet",
  bannerPhotoUrl: "https://res.cloudinarsdady.com/dnmlo67cy/image/upload/v1746655189/avljgk2jxugrtoyy1qmv.jpg",
  isPublic: true,
}
const presentationTest = {
  place: "Atanasio Girardot",
  capacity: 500,
  openDate: "2025-05-06T08:00:00Z",
  startDate: "2025-05-06T10:00:00Z",
  latitude: 6.25184,
  longitude: -75.56359,
  description: "A musical event in the main stadium.",
  ticketAvailabilityDate: "2025-04-20T00:00:00Z",
  ticketSaleAvailabilityDate: "2025-04-25T00:00:00Z",
  city: "Medellín",
  price: 50000,

}
describe('Tickets - Update (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let ticketIds: string[];
  let userRepository: Repository<User>;
  let evenRepository: Repository<Event>;
  let ticketRepository: Repository<Ticket>;
  let presentationRepository: Repository<Presentation>;
  let presentationId: string;
  let managerToken: string;
  let eventId: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, }));
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    evenRepository = app.get<Repository<Event>>(getRepositoryToken(Event));
    presentationRepository = app.get<Repository<Presentation>>(getRepositoryToken(Presentation));
    ticketRepository = app.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(UserTest);
    const res6 = await request(app.getHttpServer())
      .post('/auth/register')
      .send(UserTestManager2);
    await userRepository.update(
      { email: UserTestManager.email },
      { roles: [ValidRoles.eventManager] },
    );
    await userRepository.update(
      { email: UserTestManager2.email },
      { roles: [ValidRoles.eventManager] },
    );
    const manager = userRepository.create(UserTestManager);
    const man = await userRepository.save(manager);
    const tesevne = evenRepository.create({ ...EventTest, user: man });
    const res3 = await evenRepository.save(tesevne);
    const testpresen = presentationRepository.create({ ...presentationTest, event: res3 })
    const res4 = await presentationRepository.save(testpresen);
    presentationId = res4.idPresentation;
    eventId = res3.id;
    token = res.body.token;
    managerToken = res6.body.token;
  }, 30000);

  afterAll(async () => {
    await userRepository.delete({ email: UserTest.email });
    await presentationRepository.delete({ idPresentation: presentationId })
    await evenRepository.delete({ id: eventId })


    await app.close();
  });

  it('should buy a ticket succesfully', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tickets/buy`)
      .set('Authorization', `Bearer ${token}`)
      .send({ presentationId: presentationId, quantity: 2 });
    expect(res.status).toBe(201);
  });

  it('should not buy a ticket succesfully - not client', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tickets/buy`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ presentationId: presentationId, quantity: 2 });
    expect(res.status).toBe(403);
  });

  it('should not buy a ticket succesfully - not presentation', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tickets/buy`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ presentationId: "nany", quantity: 2 });
    expect(res.status).toBe(403);
  });


  it('should not buy a ticket succesfully - no auth', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tickets/buy`)
      .send({ presentationId: "nany", quantity: 2 });
    expect(res.status).toBe(401);
  });


});

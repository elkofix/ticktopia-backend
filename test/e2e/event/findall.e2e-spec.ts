import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { Repository } from 'typeorm';
import { User } from '../../../src/auth/entities/user.entity';
import { ValidRoles } from '..//../../src/auth/enums/valid-roles.enum';
import { CreateEventDto } from '../../../src/event/dto/create-event.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../../../src/event/entities/event.entity';


const testingEvent = {
  name: 'Concert Test',
  bannerPhotoUrl: 'https://image.com/photo.jpg',
  isPublic: true,
}

const testingEvent2 = {
  name: 'Concert Test 2',
  bannerPhotoUrl: 'https://image.com/photo2.jpg',
  isPublic: false,
}
const testingUser = {
  email: 'gusdsadas@mail.com',
  password: 'Abc123',
  name: 'Testing',
  lastname: 'teacher',
};

const testingAdminUser = {
  email: 'testingdsaddsad.admin@google.com',
  password: 'abc123',
  name: 'Testing',
  lastname: 'admin',
};

const testingEventManager = {
  email: 'testingdsadas.eventmanag@google.com',
  password: 'aBc123',
  name: 'TestingEv',
  lastname: 'eventMan',

};

describe('Events - Find All', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let eventRepository: Repository<Event>;
  let tokenEventManager: string;
  let tokenClient: string;
  let tokenAdmin: string;
  let eventManagerId: string;
  let clientId: string;
  let adminId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const responseEventManager = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingEventManager);

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);


    const responseAdmin = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    eventManagerId = responseEventManager.body.user?.id;
    clientId = responseUser.body.user?.id;
    adminId = responseAdmin.body.user?.id;

    await userRepository.update(
      { email: testingEventManager.email },
      { roles: ['event-manager'] },
    );

    await userRepository.update(
      { email: testingAdminUser.email },
      { roles: ['admin'] },
    );

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingAdminUser.email,
        password: testingAdminUser.password,
      });
    tokenAdmin = loginAdmin.body.token;

    const loginEventManager = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingEventManager.email,
        password: testingEventManager.password,
      });
    tokenEventManager = loginEventManager.body.token;

    const loginClient = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUser.email,
        password: testingUser.password,
      });
    tokenClient = loginClient.body.token;


  }, 10000);

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingEventManager.email });
    await userRepository.delete({ email: testingAdminUser.email });
    await app.close();
  });

  it('/event/findAll (GET) - valid credentials return all events', async () => {
    const response = await request(app.getHttpServer())
      .get('/event/findAll')
      .set('Authorization', `Bearer ${tokenEventManager}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
  });

  it('/event/findAll (GET) - no credentials', async () => {
    const response = await request(app.getHttpServer())
      .get('/event/findAll')
      .send();
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthorized",
      statusCode: 401
    });
  });

});
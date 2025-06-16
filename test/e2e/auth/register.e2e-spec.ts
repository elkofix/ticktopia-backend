import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { User } from "../../../src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { ValidRoles } from "../../../src/auth/enums/valid-roles.enum";
import { error } from "console";

const testingCreateUser = {
  email: 'gussi@mail.com',
  password: 'Abc12345',
  name: 'Testing',
  lastname: 'user',
};

const testingCreateClient = {
  email: 'guss@mail.com',
  password: 'Abc12345',
  name: 'Testing',
  lastname: 'user',
};

var adminToken = ""
var userToken = ""

const testingUser = {
  email: 'cami@mail.com',
  password: 'Abc12345',
  name: 'Testing',
  lastname: 'user',

};

describe('AuthModule Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

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

    const responseAdmin = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingCreateUser);
    adminToken = responseAdmin.body.token;

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingCreateClient);

    adminToken = responseAdmin.body.token;
    userToken = responseUser.body.token
    await userRepository.update(
      { email: testingCreateUser.email },
      { roles: ['admin'] },
    );
  },10000);

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingCreateUser.email });
    await userRepository.delete({ email: testingCreateClient.email });

    await app.close();
  });

  it('/auth/register (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        email: 'cami@mail.com',
        name: 'Testing',
        lastname: 'user',
        id: expect.any(String),
        isActive: true,
        roles: [ValidRoles.client],
      },
      token: expect.any(String),
    });
  });

  it('/auth/register/event-manager (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register/event-manager')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testingUser);


    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        email: 'cami@mail.com',
        name: 'Testing',
        lastname: 'user',
        id: expect.any(String),
        isActive: true,
        roles: [ValidRoles.eventManager],
      },
      token: expect.any(String),
    });
  });


  it('/auth/register/event-manager (POST) - invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register/event-manager')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testingUser);


    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden",
      message: "User guss@mail.com needs a valid role",
      statusCode: 403
    });
  });

    it('/auth/register/event-manager (POST) - not credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register/event-manager')
      .send(testingUser);


    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthorized",
      statusCode: 401
    });
  });

  it('/auth/register (POST) - no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register');

    const errorMessages =
      ["email must be an email", "email must be a string", "The password must have a Uppercase, lowercase letter and a number", "password must be longer than or equal to 6 characters", "password must be shorter than or equal to 50 characters", "password must be a string", "name must be a string", "lastname must be a string"]
      ;

    expect(response.status).toBe(400);

    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/register (POST) - same email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: `Key (email)=(${testingUser.email}) already exists.`,
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...testingUser,
        password: 'abc123',
      });

    const errorMessages = [
      'The password must have a Uppercase, lowercase letter and a number',
    ];

    expect(response.status).toBe(400);
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });


});
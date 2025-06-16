import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { User } from "../../../src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { ValidRoles } from "../../../src/auth/enums/valid-roles.enum";

const testingCreateUser = {
    email: 'gusu@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient = {
    email: 'gussu@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateToClient = {
    email: 'gussus@mail.com',
    name: 'Testings',
    lastname: 'users',
};


const testingCreateToInvalidClient = {
    email: 'gussus@mail.com',
    name: 'Testings',
    lastname: 'users',
    password: "password",
    role: "event-manager",
    isActive: true
};


const testingCreateClient2 = {
    email: 'gussu2@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

var adminToken = "";
var userToken = "";
var userID = "";
var userID2 = "";

describe('UserModule UpdateUser (e2e)', () => {
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

        const responseUser2 = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingCreateClient2);

        adminToken = responseAdmin.body.token;
        userToken = responseUser.body.token;
        userID = responseUser.body.user.id;
        userID2 = responseUser2.body.user.id;
        await userRepository.update(
            { email: testingCreateUser.email },
            { roles: ['admin'] },
        );
    }, 10000);

    afterEach(async () => {
        await userRepository.delete({ email: testingCreateUser.email });
        await userRepository.delete({ email: testingCreateClient.email });
        await userRepository.delete({ email: testingCreateToClient.email });
        await userRepository.delete({ email: testingCreateClient2.email });

        await app.close();
    });

    it('/auth/users/:id (PUT) - valid credentials - myself', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/${userID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(testingCreateToClient);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: userID,
            email: testingCreateToClient.email,
            roles: [ValidRoles.client],
            name: testingCreateToClient.name,
            lastname: testingCreateToClient.lastname,
            isActive: true
        });
    });


    it('/auth/users/:id (PUT) - invalid credentials - not myself', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/${userID2}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(testingCreateToClient);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "You can only update your own profile",
            error: "Unauthorized",
            statusCode: 401
        });
    });


    it('/auth/users/:id (PUT) - unwanted properties - myself', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/${userID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(testingCreateToInvalidClient);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: [
                "property role should not exist",
                "property isActive should not exist"
            ],
            error: "Bad Request",
            statusCode: 400
        });
    });


    it('/auth/users/:id (PUT) - no crendentials', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/${userID}`)
            .send(testingCreateToInvalidClient);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "Unauthorized",    
            statusCode: 401
        });
    });


});
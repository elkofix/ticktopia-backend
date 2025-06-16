import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role/user-role.guard';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }), // Importar PassportModule
            ],
            controllers: [HealthController],
        })
            .overrideGuard(AuthGuard('jwt')) 
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(UserRoleGuard) 
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should return status', async () => {
        const result = controller.getHealthStatus()
        expect(result).toEqual(
            { status: 'ok' }
        );
    });


});
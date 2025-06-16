import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard, PassportModule } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role/user-role.guard';
import { FailedController } from './failed.controller';

describe('FailedController', () => {
    let controller: FailedController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }), // Importar PassportModule
            ],
            controllers: [FailedController],
        })
            .overrideGuard(AuthGuard('jwt')) // Sobreescribir el AuthGuard
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(UserRoleGuard) // Sobreescribir el UserRoleGuard
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<FailedController>(FailedController);
    });

    it('should return status', async () => {
        const result = controller.showFailure()
        expect(result).toEqual(
           "PAGO FALLIDO"
        );
    });


});
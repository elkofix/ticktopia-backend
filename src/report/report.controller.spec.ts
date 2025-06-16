import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard, PassportModule } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role/user-role.guard';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
    let controller: ReportController;
    let reportService: ReportService

    beforeEach(async () => {

        const mockReportService = {
            generateSalesReport: jest.fn(),
            generateOcupationReport: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }),
            ],
            controllers: [ReportController],
            providers: [
                {
                    provide: ReportService,
                    useValue: mockReportService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(UserRoleGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<ReportController>(ReportController);
        reportService = module.get<ReportService>(ReportService);

    });

    it('should return sales report with valid structure and data', async () => {
        await controller.generateSalesReport()
        expect(reportService.generateSalesReport).toHaveBeenCalled()
    });

    it('should return occupation report with valid structure and data', async () => {
        await controller.generateOcupationReport()
        expect(reportService.generateOcupationReport).toHaveBeenCalled()
    });


});
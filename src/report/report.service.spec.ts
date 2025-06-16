import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ReportService } from "./report.service";
import { Ticket } from "src/ticket/entities/ticket.entity";


describe('ReportService', () => {
    let reportService: ReportService;
    let ticketRepository: Repository<Ticket>;
    let mockQueryBuilder: any;

    beforeEach(async () => {
        mockQueryBuilder = {
            innerJoin: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            addGroupBy: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([]),
        };

        const mockTicketRepository = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(Ticket),
                    useValue: mockTicketRepository,
                },
                ReportService
            ],
        }).compile();

        reportService = module.get<ReportService>(ReportService);
        ticketRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    });

    it('should call query to get sales report', async () => {
        await reportService.generateSalesReport();
        expect(ticketRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should call query to get ocupation report', async () => {
        await reportService.generateOcupationReport();
        expect(ticketRepository.createQueryBuilder).toHaveBeenCalled();
    });
});

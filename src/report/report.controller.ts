import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PdfService } from 'src/pdf/pdf.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService, private readonly pdfService: PdfService) { }

  @Get("sales")
  @Auth(ValidRoles.admin)
  async generateSalesReport() {
    const report = await this.reportService.generateSalesReport();
    return this.pdfService.generateSalesReportPdf(report, false);
  }

  @Get("ocupation")
  @Auth(ValidRoles.admin)
  async generateOcupationReport() {
    const report = await this.reportService.generateOcupationReport();
    return this.pdfService.generateOccupationReportPdf(report, false);
  }
}

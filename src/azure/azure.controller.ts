import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AzureService } from './azure.service';
import { CreateAzureDto } from './dto/create-azure.dto';
import { UpdateAzureDto } from './dto/update-azure.dto';

@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) { }


  @Get()
  async startVm() {
    return await this.azureService.ensureVmIsRunning("windowsVM_group", "windowsVM");
  }
}

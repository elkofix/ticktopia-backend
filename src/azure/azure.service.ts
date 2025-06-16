import { Injectable } from '@nestjs/common';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ComputeManagementClient } from '@azure/arm-compute';

@Injectable()
export class AzureService {
  private computeClient: ComputeManagementClient;

  constructor() {
    const tenantId = process.env.AZURE_TENANT_ID!;
    const clientId = process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.AZURE_CLIENT_SECRET!;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;

    const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);

    this.computeClient = new ComputeManagementClient(credentials, subscriptionId);
  }

  async ensureVmIsRunning(resourceGroupName: string, vmName: string): Promise<string> {
    const instanceView = await this.computeClient.virtualMachines.instanceView(resourceGroupName, vmName);
    const status = instanceView.statuses?.find(s => s.code?.startsWith('PowerState'))?.displayStatus || 'Unknown';

    console.log(`Estado actual de la VM "${vmName}": ${status}`);

    if (status !== 'VM running') {
      console.log(`Iniciando la VM "${vmName}"...`);
      await this.computeClient.virtualMachines.beginStartAndWait(resourceGroupName, vmName);
      return 'VM was stopped and has been started';
    } else {
      return 'VM is already running';
    }
  }


}

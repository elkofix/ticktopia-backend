import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonsModule } from './commons/commons.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';

import { EventService } from './event/event.service';
import { EventModule } from './event/event.module';
import { PresentationModule } from './presentation/presentation.module';
import { TicketModule } from './ticket/ticket.module';
import { HealthController } from './health/health.controller';
import { SuccessController } from './success/success.controller';
import { FailedController } from './failed/failed.controller';
import { ReportModule } from './report/report.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookModule } from './webhook/webhook.module';
import { GcpModule } from './gcp/gcp.module';
import { PdfModule } from './pdf/pdf.module';
import { AzureModule } from './azure/azure.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Genera el schema automáticamente
      context: ({ req, res }) => ({ req, res }), // Para usar autenticación basada en headers o cookies
    }),
    TypeOrmModule.forRoot({

      type: 'postgres',
      host: process.env.DB_HOST ?? "dpg-d0qtl2emcj7s73ed5bk0-a.oregon-postgres.render.com",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME ?? "ticktopia",
      username: process.env.DB_USERNAME ?? "ticktopia_user",
      password: process.env.DB_PASSWORD ?? "8S5BdirGFlNN3D63oJXaK4tfAEbtg2v2",
      ssl: {
        rejectUnauthorized: false // Render usa certificados auto-firmados, por eso esto va en false
      },
      autoLoadEntities: true,
      synchronize: true //Solo usarla en ambientes bajos, en producción hacer migraciones
    }),
    CommonsModule,
    SeedModule,
    AuthModule,
    EventModule,
    PresentationModule,
    TicketModule,
    ReportModule,
    WebhookModule,
    GcpModule,
    PdfModule,
    AzureModule
  ],
  controllers: [HealthController, SuccessController, FailedController, WebhookController],
  providers: [],
})
export class AppModule {

}

import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { OcupationReport, SalesReport } from 'src/report/report.service';

@Injectable()
export class PdfService {
  private colors = {
    brand: '#6366F1',
    wisteria: '#A5B4FC',
    violet: '#4F46E5',
    sandyBrown: '#f4a261',
    sunglow: '#fcd34d',
    lightGray: '#f5f5f5',
  };

  private readonly reportsDir = path.join(process.cwd(), 'reports');

  constructor() {
    // Crear directorio de reportes si no existe
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      console.log(`Directorio de reportes creado: ${this.reportsDir}`);
    }
  }

  async generateSalesReportPdf(salesReport: SalesReport, saveToFile = true): Promise<{ buffer: Buffer; data: string, filePath?: string }> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64'); // Convertir a base64

          let filePath: string | undefined;

          if (saveToFile) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            const filename = `reporte-ventas-${timestamp}-${Date.now()}.pdf`;
            filePath = path.join(this.reportsDir, filename);

            try {
              await fs.promises.writeFile(filePath, buffer);
              console.log(`PDF de ventas guardado en: ${filePath}`);
            } catch (fileError) {
              console.error('Error guardando PDF en disco:', fileError);
              // Continuamos aunque falle el guardado en disco
            }
          }

          resolve({ buffer, data: base64, filePath });
        });

        // Header del documento
        this.addHeader(doc, 'Reporte de Ventas');

        let yPosition = 150;

        // Sección: Tickets por Evento
        doc.fontSize(16)
          .fillColor(this.colors.violet)
          .text('Tickets por Evento', 50, yPosition);

        yPosition += 30;

        // Headers de la tabla
        this.drawTableHeader(doc,
          ['Evento', 'Total de Tickets'],
          [50, 300],
          yPosition
        );
        yPosition += 25;

        // Datos de tickets por evento
        salesReport.ticketsPorEvento.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? this.colors.lightGray : '#ffffff';
          console.log("evento enfilado", item.eventName)
          const rowHeigth = 50
          this.drawTableRow(doc,
            [item.eventName, item.totalTickets],
            [50, 300],
            yPosition,
            bgColor,
            [],
            rowHeigth
          );
          yPosition += 40;
        });

        yPosition += 40;

        // Verificar si necesitamos una nueva página
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Sección: Tickets por Vendedor
        doc.fontSize(16)
          .fillColor(this.colors.violet)
          .text('Tickets por Vendedor', 20, yPosition);

        yPosition += 30;

        // Headers de la tabla
        this.drawTableHeader(doc,
          ['Vendedor', 'Total de Tickets'],
          [50, 300],
          yPosition
        );
        yPosition += 25;

        // Datos de tickets por vendedor
        salesReport.ticketsPorVendedor.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? this.colors.lightGray : '#ffffff';
          const fullName = `${item.userName} ${item.userLastname}`;
          this.drawTableRow(doc,
            [fullName, item.totalTickets],
            [50, 300],
            yPosition,
            bgColor,
          );
          yPosition += 40;
        });

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  async generateOccupationReportPdf(ocupationReport: OcupationReport[], saveToFile = true): Promise<{ buffer: Buffer; data: string,filePath?: string }> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64'); // Convertir a base64

          let filePath: string | undefined;

          if (saveToFile) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            const filename = `reporte-ocupacion-${timestamp}-${Date.now()}.pdf`;
            filePath = path.join(this.reportsDir, filename);

            try {
              await fs.promises.writeFile(filePath, buffer);
              console.log(`PDF de ocupación guardado en: ${filePath}`);
            } catch (fileError) {
              console.error('Error guardando PDF en disco:', fileError);
              // Continuamos aunque falle el guardado en disco
            }
          }

          resolve({ buffer, data: base64,filePath });
        });

        // Header del documento
        this.addHeader(doc, 'Reporte de Ocupación');

        let yPosition = 150;

        // Título de la sección
        doc.fontSize(16)
          .fillColor(this.colors.violet)
          .text('Estado de Ocupación por Evento', 50, yPosition);

        yPosition += 30;

        // Headers de la tabla
        this.drawTableHeader(doc,
          ['Evento', 'Total', 'Canjeados', 'Activos', 'Ratio'],
          [50, 200, 280, 360, 440],
          yPosition
        );
        yPosition += 25;

        // Datos del reporte de ocupación
        ocupationReport.forEach((item, index) => {
          const bgColor = index % 2 === 0 ? this.colors.lightGray : '#ffffff';

          // Calcular el porcentaje para el color del ratio
          const ratio = parseFloat(item.redeemedToActiveRatio);
          const rowHeight = 50;
          let ratioColor = '#000000';
          if (ratio >= 0.8) ratioColor = '#22c55e'; // Verde
          else if (ratio >= 0.5) ratioColor = this.colors.sunglow; // Amarillo
          else ratioColor = '#ef4444'; // Rojo

          this.drawTableRow(doc,
            [
              item.eventName,
              item.totalTickets,
              item.redeemedTickets,
              item.activeTickets,
              `${(ratio * 100).toFixed(1)}%`
            ],
            [50, 200, 280, 360, 440],
            yPosition,
            bgColor,
            [null, null, null, null, ratioColor],
            rowHeight
          );
          yPosition += 40;

          // Verificar si necesitamos una nueva página
          if (yPosition > 720) {
            doc.addPage();
            yPosition = 50;
            // Redibujar headers en la nueva página
            this.drawTableHeader(doc,
              ['Evento', 'Total', 'Canjeados', 'Activos', 'Ratio'],
              [50, 200, 280, 360, 440],
              yPosition
            );
            yPosition += 25;
          }
        });

        // Agregar resumen estadístico
        yPosition += 30;
        this.addOccupationSummary(doc, ocupationReport, yPosition);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, title: string) {
    // Fondo del header
    doc.rect(0, 0, doc.page.width, 100)
      .fill(this.colors.brand);

    // Título principal
    doc.fontSize(24)
      .fillColor('white')
      .text(title, 50, 30);

    // Fecha de generación
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.fontSize(12)
      .text(`Generado el: ${currentDate}`, 50, 65);
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const footerY = doc.page.height - 50;

    doc.fontSize(10)
      .fillColor('#666666')
      .text('Sistema de Gestión de Eventos', 50, footerY, { align: 'center' });
  }

  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    headers: string[],
    positions: number[],
    y: number
  ) {
    // Fondo del header
    doc.rect(40, y - 5, doc.page.width - 80, 20)
      .fill(this.colors.wisteria);

    // Textos del header
    doc.fontSize(12)
      .fillColor('white');

    headers.forEach((header, index) => {
      doc.text(header, positions[index], y, { width: 120 });
    });
  }

  private drawTableRow(
    doc: PDFKit.PDFDocument,
    data: string[],
    positions: number[],
    y: number,
    bgColor = '#ffffff',
    textColors: (string | null)[] = [],
    rowHeight = 18 // Nuevo parámetro con valor por defecto
  ) {
    // Fondo de la fila
    doc.rect(40, y - 2, doc.page.width - 80, rowHeight)
      .fill(bgColor);

    // Textos de la fila
    doc.fontSize(10);

    data.forEach((text, index) => {
      const color = textColors[index] || '#000000';
      doc.fillColor(color)
        .text(text, positions[index], y, { width: 120 });
    });
  }


  private addOccupationSummary(
    doc: PDFKit.PDFDocument,
    data: OcupationReport[],
    startY: number
  ) {
    const totalEvents = data.length;
    const totalTickets = data.reduce((sum, item) => sum + parseInt(item.totalTickets), 0);
    const totalRedeemed = data.reduce((sum, item) => sum + parseInt(item.redeemedTickets), 0);
    const averageRatio = data.reduce((sum, item) => sum + parseFloat(item.redeemedToActiveRatio), 0) / totalEvents;

    doc.fontSize(14)
      .fillColor(this.colors.violet)
      .text('Resumen Ejecutivo', 50, startY);

    const summaryY = startY + 25;

    doc.fontSize(11)
      .fillColor('#000000')
      .text(`• Total de eventos: ${totalEvents}`, 70, summaryY)
      .text(`• Total de tickets: ${totalTickets.toLocaleString()}`, 70, summaryY + 15)
      .text(`• Tickets canjeados: ${totalRedeemed.toLocaleString()}`, 70, summaryY + 30)
      .text(`• Ratio promedio de canje: ${(averageRatio * 100).toFixed(1)}%`, 70, summaryY + 45);
  }

  // Métodos adicionales para gestión de archivos

  /**
   * Lista todos los PDFs guardados en el directorio de reportes
   */
  async listSavedReports(): Promise<{ filename: string; path: string; size: number; createdAt: Date }[]> {
    try {
      const files = await fs.promises.readdir(this.reportsDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));

      const fileDetails = await Promise.all(
        pdfFiles.map(async (filename) => {
          const filePath = path.join(this.reportsDir, filename);
          const stats = await fs.promises.stat(filePath);
          return {
            filename,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        })
      );

      // Ordenar por fecha de creación (más reciente primero)
      return fileDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error listando reportes:', error);
      return [];
    }
  }

  /**
   * Obtiene un PDF guardado por su nombre de archivo
   */
  async getSavedReport(filename: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.reportsDir, filename);

      // Verificar que el archivo existe y está dentro del directorio de reportes
      if (!fs.existsSync(filePath) || !filePath.startsWith(this.reportsDir)) {
        return null;
      }

      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error('Error obteniendo reporte guardado:', error);
      return null;
    }
  }

  /**
   * Elimina un PDF guardado
   */
  async deleteSavedReport(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.reportsDir, filename);

      // Verificar que el archivo existe y está dentro del directorio de reportes
      if (!fs.existsSync(filePath) || !filePath.startsWith(this.reportsDir)) {
        return false;
      }

      await fs.promises.unlink(filePath);
      console.log(`PDF eliminado: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      return false;
    }
  }

  /**
   * Limpia reportes antiguos (más de X días)
   */
  async cleanOldReports(daysOld = 30): Promise<number> {
    try {
      const files = await this.listSavedReports();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      for (const file of files) {
        if (file.createdAt < cutoffDate) {
          const deleted = await this.deleteSavedReport(file.filename);
          if (deleted) deletedCount++;
        }
      }

      console.log(`Limpieza completada: ${deletedCount} archivos eliminados`);
      return deletedCount;
    } catch (error) {
      console.error('Error en limpieza de reportes:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas del directorio de reportes
   */
  async getReportsStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile?: Date;
    newestFile?: Date;
  }> {
    try {
      const files = await this.listSavedReports();

      if (files.length === 0) {
        return { totalFiles: 0, totalSize: 0 };
      }

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const dates = files.map(f => f.createdAt);

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile: new Date(Math.min(...dates.map(d => d.getTime()))),
        newestFile: new Date(Math.max(...dates.map(d => d.getTime()))),
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { totalFiles: 0, totalSize: 0 };
    }
  }
}
package com.attendx.service;

import com.attendx.dto.ReportsDTOs.LowAttendanceStudentDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    private final ReportsService reportsService;

    public ExcelExportService(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    public byte[] generateLowAttendanceExcel(double threshold) throws IOException {
        List<LowAttendanceStudentDTO> list = reportsService.getLowAttendanceStudents(threshold);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Regulatory_Shortfall_Audit");

            // Fonts & Styles
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Title Rows
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ATTENDX ACADEMIC PORTAL — SIMATS / SAVEETHA SCHOOL OF ENGINEERING");
            titleCell.setCellStyle(titleStyle);

            Row subRow = sheet.createRow(1);
            subRow.createCell(0).setCellValue("OFFICIAL REGULATORY SHORTFALL AUDIT REPORT (< " + threshold + "% EXAM FEE LOCKOUT)");

            Row metaRow = sheet.createRow(2);
            metaRow.createCell(0).setCellValue("Generated On: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            // Table Header
            String[] headers = {
                "SL NO", "REGISTRATION NO", "STUDENT NAME", "CLASS", "SECTION",
                "ATTENDANCE %", "PRESENT", "ABSENT", "SHORTFALL MARGIN", "REGULATORY STATUS"
            };

            Row headerRow = sheet.createRow(4);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 5;
            for (int i = 0; i < list.size(); i++) {
                LowAttendanceStudentDTO s = list.get(i);
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(s.getRegistrationNumber());
                row.createCell(2).setCellValue(s.getFullName());
                row.createCell(3).setCellValue(s.getClassName());
                row.createCell(4).setCellValue(s.getSection());
                row.createCell(5).setCellValue(s.getAttendancePercentage() + "%");
                row.createCell(6).setCellValue(s.getPresentClasses());
                row.createCell(7).setCellValue(s.getAbsentClasses());
                row.createCell(8).setCellValue("-" + s.getShortfallMargin() + "%");
                row.createCell(9).setCellValue(s.getStatusLabel());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}


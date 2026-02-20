package com.ecommerce.service;

import com.ecommerce.model.Order;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfService {

    public byte[] generateInvoice(Order order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            // Header
            Paragraph header = new Paragraph("INVOICE", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph("\n"));

            // Order Details
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("Order #: " + order.getOrderNumber(), normalFont));
            leftCell.addElement(new Paragraph("Date: " + (order.getCreatedAt() != null
                    ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                    : "N/A"), normalFont));
            leftCell.addElement(new Paragraph("Status: " + order.getStatus(), normalFont));

            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.addElement(new Paragraph("Customer: " + order.getUserName(), normalFont));
            rightCell.addElement(new Paragraph("Email: " + order.getUserEmail(), normalFont));
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            detailsTable.addCell(leftCell);
            detailsTable.addCell(rightCell);
            document.add(detailsTable);

            document.add(new Paragraph("\n"));

            // Shipping Address
            if (order.getShippingAddress() != null) {
                document.add(new Paragraph("Shipping Address:", titleFont));
                com.ecommerce.model.Order.ShippingAddress addr = order.getShippingAddress();
                document.add(new Paragraph(addr.getFullName(), normalFont));
                document.add(new Paragraph(addr.getStreet(), normalFont));
                document.add(
                        new Paragraph(addr.getCity() + ", " + addr.getState() + " " + addr.getZipCode(), normalFont));
                document.add(new Paragraph(addr.getCountry(), normalFont));
                document.add(new Paragraph("Phone: " + addr.getPhone(), normalFont));
                document.add(new Paragraph("\n"));
            }

            // Items Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 4, 1, 2, 2 });

            // Table Header
            addTableHeader(table, "Product", tableHeaderFont);
            addTableHeader(table, "Qty", tableHeaderFont);
            addTableHeader(table, "Price", tableHeaderFont);
            addTableHeader(table, "Total", tableHeaderFont);

            // Table Data
            NumberFormat currency = NumberFormat.getCurrencyInstance(new Locale("en", "IN")); // INR

            if (order.getItems() != null) {
                for (Order.OrderItem item : order.getItems()) {
                    table.addCell(new Phrase(item.getProductName(), normalFont));
                    table.addCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                    table.addCell(new Phrase(currency.format(item.getPrice()), normalFont));
                    table.addCell(new Phrase(currency.format(item.getSubtotal()), normalFont));
                }
            }
            document.add(table);

            document.add(new Paragraph("\n"));

            // Summary
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(40);
            summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addSummaryRow(summaryTable, "Subtotal:", currency.format(order.getSubtotal()), normalFont);
            addSummaryRow(summaryTable, "Shipping:", currency.format(order.getShippingCost()), normalFont);
            addSummaryRow(summaryTable, "Tax:", currency.format(order.getTax()), normalFont);
            addSummaryRow(summaryTable, "Total:", currency.format(order.getTotalAmount()), titleFont);

            document.add(summaryTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Font font) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(Color.DARK_GRAY);
        header.setBorderWidth(1);
        header.setPhrase(new Phrase(headerTitle, font));
        header.setPadding(5);
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(header);
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}

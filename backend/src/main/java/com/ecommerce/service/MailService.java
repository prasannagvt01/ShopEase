package com.ecommerce.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.store.name:Sales Savvy}")
    private String storeName;

    // 1. Welcome Email (After Registration)
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to " + storeName + " \uD83C\uDF89";
        String content = "Hello " + userName + ",<br><br>"
                + "Welcome to " + storeName + "!<br><br>"
                + "Your account has been successfully created.<br>"
                + "You can now explore products, add items to cart, and place orders easily.<br><br>"
                + "If you have any questions, feel free to contact our support team.<br><br>"
                + "Happy Shopping! \uD83D\uDCDD<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 2. Login Alert Email
    public void sendLoginAlertEmail(String to, String userName, String device, String location) {
        String subject = "New Login to Your Account";
        String content = "Hello " + userName + ",<br><br>"
                + "Your account was successfully logged in.<br><br>"
                + "Login Details:<br>"
                + "Date: " + new Date().toString() + "<br>"
                + "Device: " + (device != null ? device : "Unknown Device") + "<br>"
                + "Location: " + (location != null ? location : "Unknown Location") + "<br><br>"
                + "If this wasn\u2019t you, please change your password immediately.<br><br>"
                + "Thank you,<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 3. Change Password Confirmation
    public void sendPasswordChangedConfirmation(String to, String userName) {
        String subject = "Your Password Has Been Changed";
        String content = "Hello " + userName + ",<br><br>"
                + "This is a confirmation that your account password was successfully changed.<br><br>"
                + "If you did not perform this action, please reset your password immediately or contact support.<br><br>"
                + "For your security, never share your password with anyone.<br><br>"
                + "Regards,<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 4. Forgot Password / Reset Password
    // 4. Forgot Password / Reset Password - OTP
    public void sendPasswordResetOtp(String to, String otp) {
        String subject = "Password Reset OTP";
        String content = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2>Password Reset Request</h2>"
                + "<p>We received a request to reset your password. Use the OTP below to proceed:</p>"
                + "<div style='background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>"
                + otp
                + "</div>"
                + "<p>This OTP is valid for <strong>2 minutes</strong>.</p>"
                + "<p>If you did not request this, please ignore this email.</p>"
                + "<br><p>Regards,<br>Team " + storeName + "</p>"
                + "</div>";

        sendHtmlEmail(to, subject, content);
    }

    // 5. Order Confirmation Email
    public void sendOrderConfirmationEmail(String to, String userName, String orderId, String date, Double amount,
            String paymentMethod, String address) {
        String subject = "Order Confirmation - #" + orderId;
        String content = "Hello " + userName + ",<br><br>"
                + "Thank you for your order! \uD83C\uDF89<br><br>"
                + "Order Details:<br>"
                + "Order ID: #" + orderId + "<br>"
                + "Order Date: " + date + "<br>"
                + "Total Amount: \u20B9" + String.format("%.2f", amount) + "<br>"
                + "Payment Method: " + paymentMethod + "<br><br>"
                + "Shipping Address:<br>"
                + address.replace("\n", "<br>") + "<br><br>"
                + "We will notify you once your order is shipped.<br><br>"
                + "You can track your order in your account dashboard.<br><br>"
                + "Thank you for shopping with us!<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 6. Payment Successful
    public void sendPaymentSuccessEmail(String to, String userName, Double amount, String orderId) {
        String subject = "Payment Successful - #" + orderId;
        String content = "Hello " + userName + ",<br><br>"
                + "Your payment of \u20B9" + String.format("%.2f", amount) + " for Order #" + orderId
                + " was successful.<br><br>"
                + "Your order is now being processed.<br><br>"
                + "Thank you for your purchase!<br><br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 7. Payment Failed
    public void sendPaymentFailedEmail(String to, String userName, String orderId) {
        String subject = "Payment Failed - Action Required";
        String content = "Hello " + userName + ",<br><br>"
                + "Unfortunately, your payment for Order #" + orderId + " was not successful.<br><br>"
                + "Please try again to complete your purchase.<br><br>"
                + "If the amount was deducted, it will be refunded within 3-5 business days.<br><br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 8. Order Shipped
    public void sendOrderShippedEmail(String to, String userName, String orderId, String trackingId, String courierName,
            String estDelivery) {
        String subject = "Your Order Has Been Shipped \uD83D\uDE9A";
        String content = "Hello " + userName + ",<br><br>"
                + "Good news! \uD83C\uDF89<br><br>"
                + "Your Order #" + orderId + " has been shipped.<br><br>"
                + "Tracking ID: " + trackingId + "<br>"
                + "Courier Partner: " + courierName + "<br>"
                + "Estimated Delivery: " + estDelivery + "<br><br>"
                + "You can track your order using the tracking ID.<br><br>"
                + "Thank you for shopping with us!<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 9. Order Delivered
    public void sendOrderDeliveredEmail(String to, String userName, String orderId) {
        String subject = "Your Order Has Been Delivered \uD83D\uDCE6";
        String content = "Hello " + userName + ",<br><br>"
                + "Your Order #" + orderId + " has been successfully delivered.<br><br>"
                + "We hope you enjoy your purchase!<br><br>"
                + "If you face any issues, please contact support within 7 days.<br><br>"
                + "\u2B50 Don\u2019t forget to leave a review!<br><br>"
                + "Thank you,<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 10. Invoice Email
    public void sendInvoiceEmail(String to, String userName, String orderId, String invoiceLink) {
        String subject = "Invoice for Your Order #" + orderId;
        String content = "Hello " + userName + ",<br><br>"
                + "Thank you for your purchase.<br><br>"
                + "Please find your invoice attached with this email.<br><br>"
                + (invoiceLink != null
                        ? "You can also download it here:<br><a href='" + invoiceLink + "'>" + invoiceLink
                                + "</a><br><br>"
                        : "")
                + "If you have any questions, contact our support team.<br><br>"
                + "Regards,<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 11. Return Approved
    public void sendReturnApprovedEmail(String to, String userName, String orderId) {
        String subject = "Return Approved - #" + orderId;
        String content = "Hello " + userName + ",<br><br>"
                + "Your return request for Order #" + orderId + " has been approved.<br><br>"
                + "Our delivery partner will collect the item soon.<br><br>"
                + "Refund will be processed after item inspection.<br><br>"
                + "Thank you,<br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    // 12. Refund Processed
    public void sendRefundProcessedEmail(String to, String userName, Double amount, String orderId) {
        String subject = "Refund Processed - #" + orderId;
        String content = "Hello " + userName + ",<br><br>"
                + "Your refund of \u20B9" + String.format("%.2f", amount) + " for Order #" + orderId
                + " has been successfully processed.<br><br>"
                + "The amount will reflect in your account within 3-5 business days.<br><br>"
                + "Thank you for your patience.<br><br>"
                + "Team " + storeName;

        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

package com.ecommerce.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Bean
    @ConditionalOnProperty(name = "razorpay.key.id", matchIfMissing = false)
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
            return null;
        }
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }
}

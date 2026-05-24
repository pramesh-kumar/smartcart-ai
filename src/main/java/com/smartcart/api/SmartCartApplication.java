package com.smartcart.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // Essential for automatically handling created_at/updated_at timestamps
public class SmartCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCartApplication.class, args);
    }
}

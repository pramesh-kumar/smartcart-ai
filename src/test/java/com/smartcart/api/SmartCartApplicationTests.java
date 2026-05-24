package com.smartcart.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Allows using a dedicated application-test.yml properties file if desired
class SmartCartApplicationTests {

    @Test
    void contextLoads() {
        // Basic integration test asserting that the Spring Context loads without exceptions.
    }
}

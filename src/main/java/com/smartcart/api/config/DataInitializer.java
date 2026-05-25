package com.smartcart.api.config;

import com.smartcart.api.domain.category.Category;
import com.smartcart.api.domain.category.CategoryRepository;
import com.smartcart.api.domain.user.Role;
import com.smartcart.api.domain.user.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing system reference data...");

        // 1. Seed 'ROLE_CUSTOMER' if not present
        if (roleRepository.findByName("ROLE_CUSTOMER").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_CUSTOMER").build());
            logger.info("Successfully seeded 'ROLE_CUSTOMER' security role.");
        }

        // 2. Seed 'ROLE_ADMIN' if not present
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_ADMIN").build());
            logger.info("Successfully seeded 'ROLE_ADMIN' security role.");
        }

        // 3. Seed default category 'Electronics' if not present to allow instant product catalog additions
        if (categoryRepository.findBySlug("electronics").isEmpty()) {
            categoryRepository.save(Category.builder()
                    .name("Electronics")
                    .slug("electronics")
                    .description("Gadgets, smartphones, laptops, and home appliances")
                    .build());
            logger.info("Successfully seeded 'Electronics' catalog category.");
        }

        logger.info("System reference data initialization completed.");
    }
}

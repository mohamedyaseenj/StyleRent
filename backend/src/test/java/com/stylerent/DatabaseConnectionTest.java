package com.stylerent;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("local")
class DatabaseConnectionTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoadsAndConnectsToMySQL() {
        String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
        assertThat(version).startsWith("8.");
    }

    @Test
    void schemaHasExpectedTables() {
        Integer tables = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'stylerentdb'",
                Integer.class);
        assertThat(tables).isEqualTo(8);
    }

    @Test
    void sampleDataIsPresent() {
        Integer users = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        Integer category = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM category", Integer.class);
        Integer clothing = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clothing", Integer.class);
        Integer clothingSize = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clothing_size", Integer.class);
        assertThat(users).isEqualTo(5);
        assertThat(category).isEqualTo(10);
        assertThat(clothing).isEqualTo(15);
        assertThat(clothingSize).isEqualTo(54);
    }
}
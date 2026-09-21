package com.stylerent;

import com.stylerent.security.JwtService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("styleRent-unit-test-secret-key-0123456789abcdef0123456789", 1000L * 60 * 60);

    @Test
    void generateAndParseToken() {
        String token = jwtService.generateToken("user@example.com", "USER");
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractEmail(token)).isEqualTo("user@example.com");
        assertThat(jwtService.extractRole(token)).isEqualTo("USER");
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void rejectionOfExpiredToken() throws InterruptedException {
        JwtService shortLived = new JwtService("styleRent-unit-test-secret-key-0123456789abcdef0123456789", 10L);
        String token = shortLived.generateToken("user@example.com", "USER");
        Thread.sleep(30);
        assertThat(shortLived.isValid(token)).isFalse();
    }

    @Test
    void rejectGarbageToken() {
        assertThat(jwtService.isValid("not.a.jwt")).isFalse();
    }
}
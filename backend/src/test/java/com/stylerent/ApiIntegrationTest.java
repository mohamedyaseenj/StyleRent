package com.stylerent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void publicCatalogEndpointsWork() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(10));

        mockMvc.perform(get("/api/clothing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(15));

        mockMvc.perform(get("/api/clothing/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.sizes.length()").value(4));

        mockMvc.perform(get("/api/clothing/1/sizes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].size").exists());
    }

    @Test
    void searchAndAvailabilityEndpointsWork() throws Exception {
        mockMvc.perform(get("/api/clothing/search").param("name", "sherwani"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        mockMvc.perform(get("/api/clothing/1/availability")
                        .param("startDate", "2027-06-01")
                        .param("endDate", "2027-06-04")
                        .param("size", "M")
                        .param("requestedQuantity", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(true))
                .andExpect(jsonPath("$.data.availableStock").value(2));
    }

    @Test
    void registerLoginAndAccessProfile() throws Exception {
        String email = "api-test-" + UUID.randomUUID().toString().substring(0, 8) + "@stylerent.com";
        String registerJson = """
                {"name":"API Tester","email":"%s","password":"secret123","phone":"9999","address":"Mumbai"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.role").value("USER"));

        String token = login(email, "secret123");

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    void unauthorizedRequestIsRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/rentals/my"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void roleGuardsProtectAdminAndOwnerEndpoints() throws Exception {
        String userToken = login("customer@stylerent.com", "customer123");

        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/owner/dashboard").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminAndOwnerDashboardsRespond() throws Exception {
        String adminToken = login("admin@stylerent.com", "admin123");
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUsers").value(5))
                .andExpect(jsonPath("$.data.totalClothing").value(15))
                .andExpect(jsonPath("$.data.totalRentals").value(6));

        String ownerToken = login("owner@stylerent.com", "owner123");
        mockMvc.perform(get("/api/owner/dashboard").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalClothing").value(15));
    }

    @Test
    void createRentalThenPaymentBackendComputesTotals() throws Exception {
        String token = login("customer@stylerent.com", "customer123");

        MvcResult rentalResult = mockMvc.perform(post("/api/rentals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2027-05-01",
                                  "endDate": "2027-05-04",
                                  "items": [ {"clothingId": 3, "size": "Free Size", "quantity": 2} ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("Pending"))
                .andExpect(jsonPath("$.data.totalAmount").value(13200.00))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].subtotal").value(13200.00))
                .andReturn();

        long rentalId = objectMapper.readTree(rentalResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();
        assertThat(rentalId).isPositive();

        MvcResult paymentResult = mockMvc.perform(post("/api/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rentalId": %d, "amount": 13200.00, "paymentMethod": "UPI"}
                                """.formatted(rentalId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.paymentStatus").value("Paid"))
                .andExpect(jsonPath("$.data.transactionId", org.hamcrest.Matchers.startsWith("TXN-")))
                .andReturn();

        long paymentId = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();
        assertThat(paymentId).isPositive();

        mockMvc.perform(get("/api/payments/rental/" + rentalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // Second payment for same rental must be rejected
        mockMvc.perform(post("/api/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"rentalId": %d, "amount": 13200.00, "paymentMethod": "Card"}
                                """.formatted(rentalId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already been paid")));
    }

    @Test
    void invalidRentalDatesAreRejected() throws Exception {
        String token = login("customer@stylerent.com", "customer123");
        mockMvc.perform(post("/api/rentals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2027-05-04",
                                  "endDate": "2027-05-01",
                                  "items": [ {"clothingId": 3, "size": "Free Size", "quantity": 1} ]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void missingResourceReturnsCleanJsonWithoutStackTraces() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/clothing/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("not found")))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("Exception");
        assertThat(body).doesNotContain("at com.stylerent");
    }

    @Test
    void reviewSubmissionWorks() throws Exception {
        String token = login("customer@stylerent.com", "customer123");
        mockMvc.perform(post("/api/reviews")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"clothingId": 3, "rating": 5, "comment": "Loved it"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.rating").value(5));

        mockMvc.perform(get("/api/reviews/clothing/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].rating").value(5));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "password": "%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.path("data").path("token").asText();
    }
}
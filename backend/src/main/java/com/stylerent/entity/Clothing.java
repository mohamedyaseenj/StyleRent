package com.stylerent.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clothing")
public class Clothing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "clothing_id")
    private Long clothingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "price_1_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal price1Day;

    @Column(name = "price_2_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal price2Day;

    @Column(name = "price_3_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal price3Day;

    @Column(name = "price_1_week", nullable = false, precision = 10, scale = 2)
    private BigDecimal price1Week;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "color", length = 60)
    private String color;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Column(name = "gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "clothing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClothingSize> sizes = new ArrayList<>();

    @OneToMany(mappedBy = "clothing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentalItem> rentalItems = new ArrayList<>();

    public Clothing() {
    }

    public Long getClothingId() {
        return clothingId;
    }

    public void setClothingId(Long clothingId) {
        this.clothingId = clothingId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getHost() {
        return host;
    }

    public void setHost(User host) {
        this.host = host;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public BigDecimal getPrice1Day() {
        return price1Day;
    }

    public void setPrice1Day(BigDecimal price1Day) {
        this.price1Day = price1Day;
    }

    public BigDecimal getPrice2Day() {
        return price2Day;
    }

    public void setPrice2Day(BigDecimal price2Day) {
        this.price2Day = price2Day;
    }

    public BigDecimal getPrice3Day() {
        return price3Day;
    }

    public void setPrice3Day(BigDecimal price3Day) {
        this.price3Day = price3Day;
    }

    public BigDecimal getPrice1Week() {
        return price1Week;
    }

    public void setPrice1Week(BigDecimal price1Week) {
        this.price1Week = price1Week;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ClothingSize> getSizes() {
        return sizes;
    }

    public List<RentalItem> getRentalItems() {
        return rentalItems;
    }
}
package com.stylerent.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "clothing_size",
        uniqueConstraints = @UniqueConstraint(name = "uq_clothing_size", columnNames = {"clothing_id", "size"}))
public class ClothingSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "clothing_size_id")
    private Integer clothingSizeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "clothing_id", nullable = false)
    private Clothing clothing;

    @Column(name = "size", nullable = false, length = 20)
    private String size;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    public ClothingSize() {
    }

    public ClothingSize(Clothing clothing, String size, Integer stock) {
        this.clothing = clothing;
        this.size = size;
        this.stock = stock;
    }

    public Integer getClothingSizeId() {
        return clothingSizeId;
    }

    public void setClothingSizeId(Integer clothingSizeId) {
        this.clothingSizeId = clothingSizeId;
    }

    public Clothing getClothing() {
        return clothing;
    }

    public void setClothing(Clothing clothing) {
        this.clothing = clothing;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
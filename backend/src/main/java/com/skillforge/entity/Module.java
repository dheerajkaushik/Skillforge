package com.skillforge.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "modules")
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable=false)
    private String title;

    @Column(length=2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private Integer position = 0; // ordering within course

    private Instant createdAt = Instant.now();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Module)) return false;
        Module module = (Module) o;
        return Objects.equals(id, module.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

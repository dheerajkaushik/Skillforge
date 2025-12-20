package com.skillforge.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @Column(name="module_id", nullable=false)
//    private Long moduleId;

    @Column(nullable=false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private LessonType type = LessonType.TEXT;

    @Column(length=5000)
    private String content; // markdown, video url, or quiz JSON

    @ManyToOne
    @JoinColumn(name = "module_id") // This links to the 'module' table
    private Module module;

    private Integer position = 0;

    private Instant createdAt = Instant.now();

    private String videoUrl;
    private String pdfUrl;


    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
//    public Long getModuleId() { return moduleId; }
//    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LessonType getType() { return type; }
    public void setType(LessonType type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public Module getModule() {
        return module;
    }

    public void setModule(Module module) {
        this.module = module;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Lesson)) return false;
        Lesson lesson = (Lesson) o;
        return Objects.equals(id, lesson.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

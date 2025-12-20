package com.skillforge.repository;

import com.skillforge.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourseIdOrderByPositionAsc(Long courseId);
    List<Module> findByCourseId(Long courseId);
}

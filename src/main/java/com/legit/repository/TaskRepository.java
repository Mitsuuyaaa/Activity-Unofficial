package com.legit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.legit.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}

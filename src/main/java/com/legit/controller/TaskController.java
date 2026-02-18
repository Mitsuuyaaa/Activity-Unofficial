package com.legit.controller;

import com.legit.entity.Task;
import com.legit.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        task.setId(null);
        Task savedTask = repository.save(task);

        return ResponseEntity
                .created(URI.create("/api/tasks/" + savedTask.getId()))
                .body(savedTask);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(repository.findAll());
    }
}


import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { TaskItem } from './models/task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  tasks = signal<TaskItem[]>([]);
  newTitle = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private taskService: TaskService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchTasks();
    }
  }

  fetchTasks(): void {
    this.loading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to load tasks');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;

    this.taskService.addTask({ title, isComplete: false }).subscribe({
      next: () => {
        this.newTitle.set('');
        this.fetchTasks();
      },
      error: (err) => {
        this.error.set('Failed to add task');
        console.error(err);
      }
    });
  }

  toggleComplete(task: TaskItem): void {
    this.taskService.updateTask(task.id, { ...task, isComplete: !task.isComplete }).subscribe({
      next: () => this.fetchTasks(),
      error: (err) => {
        this.error.set('Failed to update task');
        console.error(err);
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => this.fetchTasks(),
      error: (err) => {
        this.error.set('Failed to delete task');
        console.error(err);
      }
    });
  }
}
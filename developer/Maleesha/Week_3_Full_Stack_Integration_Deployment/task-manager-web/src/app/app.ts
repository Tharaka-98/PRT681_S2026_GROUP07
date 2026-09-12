import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { TaskItem } from './models/task.model';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

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
  newDescription = signal('');
  loading = signal(true);
  error = signal<string | null>(null);
  toasts = signal<Toast[]>([]);

  selectedTask = signal<TaskItem | null>(null);
  detailLoading = signal(false);

  private toastId = 0;

  constructor(
    private taskService: TaskService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchTasks();
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const id = this.toastId++;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismissToast(id), 3000);
  }

  dismissToast(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
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
        this.showToast('Could not load tasks', 'error');
        console.error(err);
      }
    });
  }

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;

    const description = this.newDescription().trim();

    this.taskService.addTask({
      title,
      description: description || undefined,
      isComplete: false
    }).subscribe({
      next: () => {
        this.newTitle.set('');
        this.newDescription.set('');
        this.fetchTasks();
        this.showToast('Task added', 'success');
      },
      error: (err) => {
        this.showToast('Failed to add task', 'error');
        console.error(err);
      }
    });
  }

  toggleComplete(task: TaskItem, event: Event): void {
    event.stopPropagation();
    this.taskService.updateTask(task.id, { ...task, isComplete: !task.isComplete }).subscribe({
      next: () => {
        this.fetchTasks();
        this.showToast(
          !task.isComplete ? 'Task marked complete' : 'Task marked incomplete',
          'success'
        );
      },
      error: (err) => {
        this.showToast('Failed to update task', 'error');
        console.error(err);
      }
    });
  }

  deleteTask(id: number, event: Event): void {
    event.stopPropagation();
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.fetchTasks();
        this.showToast('Task deleted', 'success');
        if (this.selectedTask()?.id === id) {
          this.closeDetail();
        }
      },
      error: (err) => {
        this.showToast('Failed to delete task', 'error');
        console.error(err);
      }
    });
  }

  viewTask(id: number): void {
    this.detailLoading.set(true);
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.selectedTask.set(task);
        this.detailLoading.set(false);
      },
      error: (err) => {
        this.showToast('Failed to load task details', 'error');
        this.detailLoading.set(false);
        console.error(err);
      }
    });
  }

  closeDetail(): void {
    this.selectedTask.set(null);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type TaskItem = {
  id: number;
  title: string;
  isCompleted: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  tasks: TaskItem[] = [];
  title = '';

  apiUrl = 'http://localhost:5227/api/tasks';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<TaskItem[]>(this.apiUrl)
      .subscribe(data => {
        this.tasks = data;
      });
  }

  addTask(): void {
    if (!this.title.trim()) {
      return;
    }

    const newTask = {
      title: this.title,
      isCompleted: false
    };

    this.http.post(this.apiUrl, newTask)
      .subscribe(() => {
        this.title = '';
        this.loadTasks();
      });
  }

  completeTask(task: TaskItem): void {

    const updatedTask = {
      id: task.id,
      title: task.title,
      isCompleted: true
    };

    this.http.put(
      `${this.apiUrl}/${task.id}`,
      updatedTask
    )
    .subscribe(() => {
      this.loadTasks();
    });
  }

  deleteTask(id: number): void {

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe(() => {
        this.loadTasks();
      });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFiltersDto } from './dto/get-tasks-filters.dto';
import { TaskStatus } from './tasks-status.enum';
import { Task } from './tasks.entity';
@Injectable()
export class TasksService {
  @InjectRepository(Task)
  private readonly repository: Repository<Task>;

  async getTaskById(id: string): Promise<Task> {
    const foundTask = await this.repository.findOne({ where: { id } });
    if (!foundTask) {
      throw new NotFoundException(`task with ID ${id} is not existed`);
    }
    return foundTask;
  }
  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  // getTasksFilter(filterDto: GetTasksFiltersDto): Task[] {
  //   const { search, status } = filterDto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter((task) => task.status === status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter((task) => {
  //       if (task.title.includes(search) || task.description.includes(search)) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     });
  //   }
  //   return tasks;
  // }
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });
    await this.repository.save(task);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`task with ID ${id} is not found`);
    }
  }
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = status;
    await this.repository.save(task);
    return task;
  }
}

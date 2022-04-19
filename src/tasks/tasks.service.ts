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
  async getTasks(filterDto: GetTasksFiltersDto): Promise<Task[]> {
    const { search, status } = filterDto;
    const query = this.repository.createQueryBuilder('task');
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        {
          search: `%${search}%`,
        },
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }
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

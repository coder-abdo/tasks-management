import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFiltersDto } from './dto/get-tasks-filters.dto';
import { TaskStatus } from './tasks-status.enum';
import { Task } from './tasks.entity';
@Injectable()
export class TasksService {
  @InjectRepository(Task)
  private readonly repository: Repository<Task>;

  async getTaskById(id: string, user: User): Promise<Task> {
    const foundTask = await this.repository.findOne({ where: { id, user } });
    if (!foundTask) {
      throw new NotFoundException(`task with ID ${id} is not existed`);
    }
    return foundTask;
  }
  async getTasks(filterDto: GetTasksFiltersDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;
    const query = this.repository.createQueryBuilder('task');
    query.where({ user });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        },
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.repository.save(task);
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.repository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException(`task with ID ${id} is not found`);
    }
  }
  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.repository.save(task);
    return task;
  }
}

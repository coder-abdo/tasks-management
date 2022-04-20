import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly authRepository: Repository<User>;

  async signup(signUpDto: AuthDto): Promise<void> {
    const { username, password } = signUpDto;
    const user = this.authRepository.create({ username, password });
    await this.authRepository.save(user);
  }
}

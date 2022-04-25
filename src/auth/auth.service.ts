import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { genSalt, hash, compare } from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { User } from './user.entity';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly authRepository: Repository<User>;
  constructor(private readonly jwtService: JwtService) {}
  async signup(signUpDto: AuthDto): Promise<void> {
    const { username, password } = signUpDto;
    try {
      const salt = await genSalt();
      const hashedPassword = await hash(password, salt);
      const user = this.authRepository.create({
        username,
        password: hashedPassword,
      });
      await this.authRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username is already exist');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  async signIn(signInDto: AuthDto): Promise<{ accessToken: string }> {
    const { password, username } = signInDto;
    const user = await this.authRepository.findOne({ where: { username } });
    if (user && (await compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException();
    }
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../decorator/role';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromHeader(request.headers.authorization);

    if (!token) {
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const roleFromToken = decoded.role;
      const userIdFromToken = decoded.userId;

      if (roleFromToken === Role.ADMIN) {
        request.user = decoded;
        return true;
      }

      let userId: number | undefined;

      if (request.body && request.body.userId) {
        userId = +request.body.userId;
      }
      if (!userId && request.params.userId) {
        userId = +request.params.userId;
      }

      if (userId && userId === userIdFromToken) {
        request.user = decoded;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private extractJwtFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '');
    return token;
  }
}

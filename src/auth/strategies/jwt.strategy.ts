import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from "../interfaces/jwt.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET') as string ?? "super-secreto",
            // Cambia esta línea para extraer el token de la cookie
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const {id} = payload;
        const user = await this.userRepository.findOneBy({id});

        if(!user) throw new UnauthorizedException(`Token not valid`);
        
        if(!user.isActive) throw new UnauthorizedException(`User is not active`);
        
        delete user.password;

        return user;
    }
}
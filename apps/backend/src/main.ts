import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan pembacaan HttpOnly Cookie
  app.use(cookieParser());

  // Direktori penyimpanan media (avatars, certificates)
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');
  const certsDir = path.join(uploadsDir, 'certificates');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
  if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

  // Middleware global: Cross-Origin headers untuk akses asset statis & streaming
  app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // Akses file statis langsung via /uploads, /talents/avatar, dan /talents/certificates
  app.use('/uploads', express.static(uploadsDir));
  app.use('/talents/avatar', express.static(avatarsDir));
  app.use('/talents/certificates', express.static(certsDir));

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Pengaturan CORS untuk Frontend Next.js & Cross-Origin Resource Policy
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true, // Wajib TRUE agar cookie dapat dikirim silang domain
  });

  await app.listen(3000);
  console.log(`Backend Mimika Talenta berjalan di: http://localhost:3000`);
}
bootstrap();

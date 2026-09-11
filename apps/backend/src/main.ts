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

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');
  const certsDir = path.join(uploadsDir, 'certificates');
  const nibsDir = path.join(uploadsDir, 'nibs');
  const logosDir = path.join(uploadsDir, 'logos');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
  if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });
  if (!fs.existsSync(nibsDir)) fs.mkdirSync(nibsDir, { recursive: true });
  if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

  // Middleware global: Cross-Origin headers untuk akses asset statis & streaming
  app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // PROTECTED VARIATIONS: Hapus express.static untuk /uploads, /talents/certificates, dan /uploads/nibs
  // Seluruh dokumen sensitif PDF wajib melalui Controller berotentikasi JWT Guard.
  // Hanya foto avatar publik yang diperbolehkan diakses statis:
  app.use('/talents/avatar', express.static(avatarsDir));

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

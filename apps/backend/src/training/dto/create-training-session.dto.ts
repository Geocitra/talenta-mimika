import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SessionContentType } from '@prisma/client';

export class CreateTrainingSessionDto {
  @IsInt()
  @Min(1)
  sessionOrder: number;

  @IsString()
  @IsNotEmpty({ message: 'Judul sesi materi wajib diisi.' })
  title: string;

  @IsEnum(SessionContentType, { message: 'Tipe konten harus VIDEO, TEXT_ARTICLE, atau DOCUMENT_PDF.' })
  contentType: SessionContentType;

  @IsString()
  @IsNotEmpty({ message: 'Isi artikel bacaan atau URL video wajib diisi.' })
  contentBody: string;

  @IsOptional()
  @IsBoolean()
  hasCheckpointQuiz?: boolean;
}

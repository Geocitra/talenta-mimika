import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmitQuizAnswerDto {
  @IsObject()
  @IsNotEmpty({ message: 'Jawaban butir soal wajib dikirim.' })
  answers: Record<string, string>; // { "questionId": "A", ... }
}

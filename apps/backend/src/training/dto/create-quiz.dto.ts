import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizType } from '@prisma/client';

export class CreateQuestionItemDto {
  @IsInt()
  @Min(1)
  questionOrder: number;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @IsNotEmpty()
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]

  @IsString()
  @IsNotEmpty()
  correctAnswer: string; // "A"

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuizDto {
  @IsEnum(QuizType)
  quizType: QuizType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(50)
  @Max(100)
  passingScore: number;

  @IsOptional()
  @IsInt()
  timeLimitMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionItemDto)
  questions: CreateQuestionItemDto[];
}

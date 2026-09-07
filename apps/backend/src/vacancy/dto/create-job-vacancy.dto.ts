import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateJobVacancyDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul posisi pekerjaan wajib diisi.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Rincian tugas pekerjaan wajib diisi.' })
  taskDescription: string;

  @IsString()
  @IsNotEmpty({ message: 'Durasi proyek/pekerjaan wajib diisi.' })
  projectDuration: string;

  @IsArray()
  @IsNotEmpty({ message: 'Daftar keahlian yang dibutuhkan wajib diisi.' })
  requiredSkills: string[];

  @IsString()
  @IsNotEmpty({ message: 'Standar minimal pendidikan wajib diisi.' })
  minEducation: string;

  @IsInt()
  @Min(0, { message: 'Minimal pengalaman tidak boleh negatif.' })
  minExperienceYears: number;

  @IsOptional()
  @IsBoolean()
  allowEquivalence?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  jobLocationLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  jobLocationLng?: number;
}

import { IsBoolean } from 'class-validator';

export class AdminUpdateListingDto {
  @IsBoolean()
  active!: boolean;
}

import { IsBoolean, IsString } from 'class-validator'

export class BucketConfig {
  @IsString()
  firebaseServiceAccountKeyPath!: string

  @IsString()
  bucketName!: string

  @IsBoolean()
  isMock!: boolean
}

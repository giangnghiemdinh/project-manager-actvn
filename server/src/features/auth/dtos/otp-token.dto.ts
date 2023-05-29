import { ApiProperty } from '@nestjs/swagger';

export class OtpTokenResponseDto {
  @ApiProperty()
  secret: string;

  @ApiProperty()
  url?: string;

  constructor(data: { secret: string; url: string }) {
    this.secret = data.secret;
    this.url = data.url;
  }
}

import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecretSantaService } from './secret-santa.service';

@ApiTags('Secret Santa')
@Controller('/secret-santa')
export class SecretSantaController {
  constructor(private readonly secretSantaService: SecretSantaService) {}
}

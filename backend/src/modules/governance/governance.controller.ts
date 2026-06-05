import { Controller, Get } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }
}

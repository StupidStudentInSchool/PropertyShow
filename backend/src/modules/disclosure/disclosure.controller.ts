import { Controller, Get } from '@nestjs/common';
import { DisclosureService } from './disclosure.service';

@Controller('disclosure')
export class DisclosureController {
  constructor(private readonly disclosureService: DisclosureService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }
}

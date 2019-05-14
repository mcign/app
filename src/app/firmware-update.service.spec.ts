import { TestBed } from '@angular/core/testing';

import { FirmwareUpdateService } from './firmware-update.service';

describe('FirmwareUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirmwareUpdateService = TestBed.get(FirmwareUpdateService);
    expect(service).toBeTruthy();
  });
});

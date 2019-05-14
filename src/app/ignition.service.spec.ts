import { TestBed } from '@angular/core/testing';

import { IgnitionService } from './ignition.service';

describe('IgnitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IgnitionService = TestBed.get(IgnitionService);
    expect(service).toBeTruthy();
  });
});

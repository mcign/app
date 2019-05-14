import { TestBed } from '@angular/core/testing';

import { MasterKeyDataService } from './master-key-data.service';

describe('MasterKeyDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MasterKeyDataService = TestBed.get(MasterKeyDataService);
    expect(service).toBeTruthy();
  });
});

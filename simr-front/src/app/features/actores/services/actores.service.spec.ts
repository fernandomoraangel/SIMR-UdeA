import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActoresService } from './actores.service';

describe('ActoresService', () => {
  let service: ActoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ActoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

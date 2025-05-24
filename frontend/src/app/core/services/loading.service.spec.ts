import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with loading state false', (done) => {
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });

  describe('show', () => {
    it('should set loading to true when called once', (done) => {
      service.show();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });

    it('should maintain loading true when called multiple times', (done) => {
      service.show();
      service.show();
      service.show();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });
  });

  describe('hide', () => {
    it('should set loading to false when hide count matches show count', (done) => {
      service.show();
      service.hide();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should keep loading true when hide count is less than show count', (done) => {
      service.show();
      service.show();
      service.hide();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });

    it('should not go below zero requests', (done) => {
      service.hide();
      service.hide();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('request counting', () => {
    it('should properly handle multiple concurrent requests', (done) => {
      let emissionCount = 0;
      const expectedStates = [false, true, true, true, true, true, false];

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(expectedStates[emissionCount]);
        emissionCount++;

        if (emissionCount === expectedStates.length) {
          done();
        }
      });

      // Initial state: false (emissionCount: 0)

      // Start 3 requests
      service.show(); // true (emissionCount: 1)
      service.show(); // true (emissionCount: 2)
      service.show(); // true (emissionCount: 3)

      // Complete 2 requests
      service.hide(); // still true (emissionCount: 4)
      service.hide(); // still true (emissionCount: 5)

      // Complete last request
      service.hide(); // false (emissionCount: 6)
    });

    it('should handle complex sequence of show/hide calls', (done) => {
      const states: boolean[] = [];

      service.loading$.subscribe((loading) => {
        states.push(loading);
      });

      // Execute sequence
      service.show(); // true
      service.show(); // true (no change)
      service.hide(); // true (still has 1 request)
      service.show(); // true (no change)
      service.hide(); // true (still has 1 request)
      service.hide(); // false (all requests completed)

      setTimeout(() => {
        // Remove initial false state and check the sequence
        const actualStates = states.slice(1);
        expect(actualStates).toEqual([true, true, true, false]);
        done();
      }, 0);
    });
  });

  describe('reset behavior', () => {
    it('should handle rapid show/hide cycles correctly', (done) => {
      let changeCount = 0;

      service.loading$.subscribe((loading) => {
        changeCount++;

        if (changeCount === 5) {
          // Initial + 4 changes
          expect(loading).toBe(false);
          done();
        }
      });

      // Rapid sequence
      service.show(); // true
      service.hide(); // false
      service.show(); // true
      service.hide(); // false
    });
  });

  describe('edge cases', () => {
    it('should handle hide being called before any show', (done) => {
      service.hide();
      service.hide();
      service.hide();

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should properly reset after many operations', (done) => {
      // Perform many operations
      for (let i = 0; i < 10; i++) {
        service.show();
      }

      for (let i = 0; i < 10; i++) {
        service.hide();
      }

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });
});

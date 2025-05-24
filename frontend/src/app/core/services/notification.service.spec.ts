import { TestBed } from '@angular/core/testing';
import {
  NotificationService,
  NotificationMessage,
} from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    // Clear all notifications after each test
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should add a success notification', (done) => {
      const title = 'Success Title';
      const message = 'Success message';

      service.success(title, message);

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].type).toBe('success');
        expect(messages[0].title).toBe(title);
        expect(messages[0].message).toBe(message);
        expect(messages[0].duration).toBe(5000);
        expect(messages[0].autoClose).toBe(true);
        done();
      });
    });

    it('should add a success notification with custom duration', (done) => {
      const title = 'Success Title';
      const message = 'Success message';
      const duration = 3000;

      service.success(title, message, duration);

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].duration).toBe(duration);
        done();
      });
    });
  });

  describe('error', () => {
    it('should add an error notification', (done) => {
      const title = 'Error Title';
      const message = 'Error message';

      service.error(title, message);

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].type).toBe('error');
        expect(messages[0].title).toBe(title);
        expect(messages[0].message).toBe(message);
        expect(messages[0].duration).toBe(8000);
        expect(messages[0].autoClose).toBe(true);
        done();
      });
    });
  });

  describe('warning', () => {
    it('should add a warning notification', (done) => {
      const title = 'Warning Title';
      const message = 'Warning message';

      service.warning(title, message);

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].type).toBe('warning');
        expect(messages[0].title).toBe(title);
        expect(messages[0].message).toBe(message);
        expect(messages[0].duration).toBe(6000);
        expect(messages[0].autoClose).toBe(true);
        done();
      });
    });
  });

  describe('info', () => {
    it('should add an info notification', (done) => {
      const title = 'Info Title';
      const message = 'Info message';

      service.info(title, message);

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].type).toBe('info');
        expect(messages[0].title).toBe(title);
        expect(messages[0].message).toBe(message);
        expect(messages[0].duration).toBe(5000);
        expect(messages[0].autoClose).toBe(true);
        done();
      });
    });
  });

  describe('remove', () => {
    it('should remove a notification by id', (done) => {
      service.success('Title 1', 'Message 1');
      service.success('Title 2', 'Message 2');

      // Get the first notification's ID
      service.messages$.subscribe((messages) => {
        if (messages.length === 2) {
          const firstId = messages[0].id;

          // Remove the first notification
          service.remove(firstId);

          // Check that only one notification remains
          service.messages$.subscribe((updatedMessages) => {
            if (updatedMessages.length === 1) {
              expect(updatedMessages[0].title).toBe('Title 2');
              done();
            }
          });
        }
      });
    });

    it('should not affect other notifications when removing non-existent id', (done) => {
      service.success('Title 1', 'Message 1');

      service.remove('non-existent-id');

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(1);
        expect(messages[0].title).toBe('Title 1');
        done();
      });
    });
  });

  describe('clear', () => {
    it('should remove all notifications', (done) => {
      service.success('Title 1', 'Message 1');
      service.error('Title 2', 'Message 2');
      service.warning('Title 3', 'Message 3');

      service.clear();

      service.messages$.subscribe((messages) => {
        expect(messages).toHaveSize(0);
        done();
      });
    });
  });

  describe('auto-close functionality', () => {
    it('should auto-close notifications after specified duration', (done) => {
      const duration = 100; // Short duration for testing

      service.success('Test Title', 'Test Message', duration);

      // Check that notification is initially present
      service.messages$.subscribe((messages) => {
        if (messages.length === 1) {
          // Wait for auto-close
          setTimeout(() => {
            service.messages$.subscribe((updatedMessages) => {
              expect(updatedMessages).toHaveSize(0);
              done();
            });
          }, duration + 50); // Add buffer time
        }
      });
    });

    it('should not auto-close notifications with duration 0', (done) => {
      service.success('Test Title', 'Test Message', 0);

      service.messages$.subscribe((messages) => {
        if (messages.length === 1) {
          expect(messages[0].autoClose).toBe(false);

          // Wait a bit to ensure it doesn't auto-close
          setTimeout(() => {
            service.messages$.subscribe((updatedMessages) => {
              expect(updatedMessages).toHaveSize(1);
              done();
            });
          }, 100);
        }
      });
    });
  });

  describe('unique IDs', () => {
    it('should generate unique IDs for each notification', (done) => {
      service.success('Title 1', 'Message 1');
      service.success('Title 2', 'Message 2');
      service.success('Title 3', 'Message 3');

      service.messages$.subscribe((messages) => {
        if (messages.length === 3) {
          const ids = messages.map((m) => m.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(3); // All IDs should be unique
          done();
        }
      });
    });
  });
});

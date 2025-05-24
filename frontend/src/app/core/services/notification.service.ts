import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messagesSubject = new BehaviorSubject<NotificationMessage[]>([]);
  private nextId = 1;

  /**
   * Observable that emits the current list of notifications
   */
  messages$: Observable<NotificationMessage[]> =
    this.messagesSubject.asObservable();

  /**
   * Show a success notification
   */
  success(title: string, message: string, duration: number = 5000): void {
    this.show('success', title, message, duration);
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, duration: number = 8000): void {
    this.show('error', title, message, duration);
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, duration: number = 6000): void {
    this.show('warning', title, message, duration);
  }

  /**
   * Show an info notification
   */
  info(title: string, message: string, duration: number = 5000): void {
    this.show('info', title, message, duration);
  }
  /**
   * Show a notification
   */
  private show(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration: number = 5000
  ): void {
    const notification: NotificationMessage = {
      id: (this.nextId++).toString(),
      type,
      title,
      message,
      duration,
      autoClose: duration > 0,
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, notification]);

    // Auto-close the notification after the specified duration
    if (notification.autoClose && duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    const currentMessages = this.messagesSubject.value;
    const filteredMessages = currentMessages.filter((msg) => msg.id !== id);
    this.messagesSubject.next(filteredMessages);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.messagesSubject.next([]);
  }
}

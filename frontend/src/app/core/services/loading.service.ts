import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  /**
   * Observable that emits the current loading state
   */
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Show the loading indicator
   */
  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Hide the loading indicator
   */
  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Force hide the loading indicator (useful for error handling)
   */
  forceHide(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }

  /**
   * Get the current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isLoading"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <div class="text-gray-700 font-medium">Loading...</div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class GlobalLoadingComponent implements OnInit, OnDestroy {
  isLoading = false;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.subscription = this.loadingService.loading$.subscribe(
      (isLoading) => (this.isLoading = isLoading)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

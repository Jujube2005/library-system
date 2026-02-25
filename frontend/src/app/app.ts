import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  loading = false;
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Move to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loading = true;
          this.cdr.detectChanges();
        });
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 300); // Small delay for smooth transition
      }
    });
  }
}

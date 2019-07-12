import { AfterViewChecked, Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

export interface NgNoCheckContext {
  $implicit: NgNoCheck;
}

@Directive({
  selector: '[ngNoCheck]',
})
export class NgNoCheck implements AfterViewChecked {
  @Input() set ngNoCheck(value: boolean) {
    this.noCheck = value !== false;

    if (this.detached && !this.noCheck) {
      this.view.reattach();
      this.detached = false;
    }
  }

  @Input() set ngNoCheckNotifier(value: Observable<void>) {
    if (value !== this.notifier) {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      if (value) {
        this.notifier = value;
        this.subscription = this.notifier.subscribe(() => {
          this.check();
        });
      } else {
        this.notifier = null;
      }
    }
  }

  private noCheck: boolean = true;
  private notifier: Observable<void>|null = null;
  private subscription: Subscription|null = null;
  private detached: boolean = false;
  private view: EmbeddedViewRef<NgNoCheckContext>;

  constructor(private template: TemplateRef<NgNoCheckContext>, private vcRef: ViewContainerRef) {
    this.view = this.vcRef.createEmbeddedView(this.template, { $implicit: this });
  }

  ngAfterViewChecked(): void {
    if (!this.detached && this.noCheck) {
      this.view.detach();
      this.detached = true;
    }
  }

  check(): void {
    if (this.detached) {
      this.view.detectChanges();
    }
  }
}

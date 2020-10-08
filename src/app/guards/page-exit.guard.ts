import { Injectable, HostListener } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export abstract class ComponentCanDeactivate {
  abstract canDeactivate(): boolean;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (!this.canDeactivate()) {
      $event.returnValue = true;
    }
  }
}
export abstract class PageCanDeactivate extends ComponentCanDeactivate {
  abstract saved: boolean = false;
  canDeactivate(): boolean {
    return this.saved;
  }
}

@Injectable()
export class PageExitGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean {
    if (!component.canDeactivate()) {
      if (
        confirm(
          'You did not save your change. Are you sure to leave this page?'
        )
      ) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}

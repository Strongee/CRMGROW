import { Injectable, ViewContainerRef } from '@angular/core';
import {
  Overlay,
  OverlayContainer,
  ConnectionPositionPair,
  PositionStrategy,
  OverlayConfig
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  overlayRef: any;
  sub: Subscription;
  private afterClosed = new Subject<any>();
  onClosed = this.afterClosed.asObservable();

  constructor(
    private overlay: Overlay,
    private overlayContainer: OverlayContainer
  ) {}

  open(
    origin: any,
    menu: any,
    viewContainerRef: ViewContainerRef,
    type: string,
    data: any
  ): any {
    if (
      type == 'create' &&
      (this.overlayRef != null || this.overlayRef != undefined)
    ) {
      this.close(null);
      return this.onClosed.pipe(take(1));
    } else {
      this.close(null);
      this.overlayRef = this.overlay.create(
        this.getOverlayConfig({ origin: origin })
      );
      this.overlayRef.attach(
        new TemplatePortal(menu, viewContainerRef, {
          $implicit: data,
          close: this.close
        })
      );
      setTimeout(() => {
        if (type == 'automation') {
          if (
            this.overlayContainer.getContainerElement().getBoundingClientRect()
              .width == 0
          ) {
            return;
          } else {
            this.sub = fromEvent<MouseEvent>(document, 'click')
              .pipe(
                filter((event) => {
                  const clickTarget = event.target as HTMLElement;
                  return (
                    clickTarget != origin &&
                    !!this.overlayRef &&
                    !this.overlayRef.overlayElement.contains(clickTarget)
                  );
                }),
                take(1)
              )
              .subscribe(() => {
                this.close(null);
              });
          }
        } else {
          this.sub = fromEvent<MouseEvent>(document, 'click')
            .pipe(
              filter((event) => {
                const clickTarget = event.target as HTMLElement;
                return (
                  clickTarget != origin &&
                  !!this.overlayRef &&
                  !this.overlayRef.overlayElement.contains(clickTarget) &&
                  this.overlayRef.overlayElement.contains(clickTarget)
                );
              }),
              take(1)
            )
            .subscribe(() => {
              this.close(null);
            });
        }
      });
      return this.onClosed.pipe(take(1));
    }
  }

  close = (data: any) => {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.afterClosed.next(data);
    }
  };
  private getOverlayPosition(origin: any): PositionStrategy {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withPush(false);
    return positionStrategy;
  }
  private getOverlayConfig({ origin }): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: false,
      backdropClass: 'popover-backdrop',
      positionStrategy: this.getOverlayPosition(origin)
    });
  }
  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top'
      },
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'bottom'
      },
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'bottom'
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'bottom'
      }
    ];
  }
}

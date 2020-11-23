import { Injectable, Injector } from '@angular/core';
import {
  Overlay,
  ConnectionPositionPair,
  PositionStrategy,
  OverlayConfig
} from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { myOverlayRef, OverlayContent } from '../variables/overlay-ref';
import { ComponentType } from 'ngx-toastr';

export type OverlayParams<T> = {
  width?: string | number;
  height?: string | number;
  origin: HTMLElement;
  content: OverlayContent;
  data?: T;
};

@Injectable({
  providedIn: 'root'
})
export class OveralyService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>({
    origin,
    content,
    data,
    width,
    height
  }: OverlayParams<T>): myOverlayRef<T> {
    const overlayRef = this.overlay.create(
      this.getOverlayConfig({ origin, width, height })
    );
    const popoverRef = new myOverlayRef<T>(overlayRef, content, data);

    const injector = this.createInjector(popoverRef, this.injector);
    overlayRef.attach(new ComponentPortal(content, null, injector));

    return popoverRef;
  }

  private getOverlayConfig({ origin, width, height }): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: true,
      width,
      height,
      backdropClass: 'popover-backdrop',
      positionStrategy: this.getOverlayPosition(origin),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(false);

    return positionStrategy;
  }

  createInjector(popoverRef: myOverlayRef, injector: Injector): any {
    const tokens = new WeakMap([[myOverlayRef, popoverRef]]);
    return new PortalInjector(injector, tokens);
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
      },
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
      }
    ];
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { OverlayService } from 'src/app/services/overlay.service';

@Component({
  selector: 'app-automation-tree-overlay',
  templateUrl: './automation-tree-overlay.component.html',
  styleUrls: ['./automation-tree-overlay.component.scss']
})
export class AutomationTreeOverlayComponent implements OnInit {
  @Input('dataSource') node;
  constructor(private overlayService: OverlayService) {}

  ngOnInit(): void {}

  overlayClose(): void {
    this.overlayService.close(null);
  }
}

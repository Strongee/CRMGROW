import { Component, Input, OnInit } from '@angular/core';
import { OverlayService } from 'src/app/services/overlay.service';
import { LabelService } from 'src/app/services/label.service';

@Component({
  selector: 'app-automation-detail-overlay',
  templateUrl: './automation-detail-overlay.component.html',
  styleUrls: ['./automation-detail-overlay.component.scss']
})
export class AutomationDetailOverlayComponent implements OnInit {
  @Input('dataSource') node;
  constructor(
    private overlayService: OverlayService,
    public labelService: LabelService
  ) {}

  ngOnInit(): void {
    console.log('####', this.node);
  }

  update(): void {
    this.overlayService.close('edit');
  }

  remove(): void {
    this.overlayService.close('remove');
  }
}

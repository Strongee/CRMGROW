import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Label } from 'src/app/models/label.model';
import { LabelService } from 'src/app/services/label.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-contact-merge-label',
  templateUrl: './contact-merge-label.component.html',
  styleUrls: ['./contact-merge-label.component.scss']
})
export class ContactMergeLabelComponent implements OnInit {
  @Input()
  public set source(val: string) {
    this.sourceLabelId = val;
    const labels = this.labelService.labels.getValue();
    this.sourceLabel = _.find(labels, (e) => e._id === val);
    this.formControl.setValue(this.sourceLabel, { emitEvent: false });
  }
  @Input()
  public set merge(val: string) {
    this.mergeLabelId = val;
    const labels = this.labelService.labels.getValue();
    this.mergeLabel = _.find(labels, (e) => e._id === val);
  }
  @Input('defaultLabel') defaultLabel = 'No Label';
  @ViewChild('inputField') trigger: ElementRef;
  sourceLabel: Label = new Label();
  mergeLabel: Label = new Label();
  sourceLabelId: string = '';
  mergeLabelId: string = '';
  formControl: FormControl = new FormControl();
  constructor(public labelService: LabelService) {}

  ngOnInit(): void {}

  focusField(): void {
    this.trigger.nativeElement.focus();
    this.trigger.nativeElement.blur();
  }
}

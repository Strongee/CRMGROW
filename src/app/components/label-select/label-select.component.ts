import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { LabelService } from 'src/app/services/label.service';
import * as _ from 'lodash';
import { Label } from 'src/app/models/label.model';
@Component({
  selector: 'app-label-select',
  templateUrl: './label-select.component.html',
  styleUrls: ['./label-select.component.scss']
})
export class LabelSelectComponent implements OnInit, AfterViewInit {
  @Input('value') value = '';

  @ViewChild('selector') selector: MatSelect;

  formControl: FormControl = new FormControl();
  constructor(public labelService: LabelService) {}

  ngOnInit(): void {
    this.labelService.labels$.subscribe((res) => {
      const value = _.find(res, (e) => e._id === this.value);
      this.formControl.setValue(value);
    });

    this.formControl.valueChanges.subscribe((value) => {});
  }

  ngAfterViewInit(): void {
    this.selector._positions = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top'
      }
    ];
  }
}

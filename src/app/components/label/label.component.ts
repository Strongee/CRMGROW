import { Component, OnInit, ViewContainerRef, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LabelService } from '../../services/label.service';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<LabelComponent>,
    public vcRef: ViewContainerRef,
    private labelService: LabelService,
    private dialog: MatDialog
  ) {}

  labelColor = '';
  labelFontColor = '';
  labelName = '';
  playerName = '';
  selectedContact;
  label = {
    name: '',
    font_color: '',
    color: ''
  };
  submitted = false;
  isLoading = false;
  noteCreateSubscription: Subscription;

  contacts = [];
  myControl = new FormControl();
  contactSearchSubscription: Subscription;
  contactLoadingSubscription: Subscription;
  isProcessing = false;
  labelsLength = 0;

  colors = [
    {
      color: '#B22A80',
      font_color: 'black',
      active: false
    },
    {
      color: '#E930C0',
      font_color: 'black',
      active: false
    },
    {
      color: '#FEFF60',
      font_color: 'black',
      active: false
    },
    {
      color: '#FF8EF9',
      font_color: 'black',
      active: false
    },
    {
      color: '#0B1C48',
      font_color: 'white',
      active: false
    },
    {
      color: '#E66912',
      font_color: 'white',
      active: false
    },
    {
      color: '#9E3A14',
      font_color: 'white',
      active: false
    },
    {
      color: '#016367',
      font_color: 'white',
      active: false
    }
  ];

  ngOnInit(): void {
    this.getCustomLabelsLength();
  }

  getCustomLabelsLength(): void {
    this.labelService.getLabels().subscribe(
      async (res: any) => {
        this.labelsLength = res.data.filter(
          (label) => label.role !== 'admin'
        ).length;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  public onEventLog(event: string, data: any): void {
    console.log(event, data);
  }

  public onChangeColor(color: string): void {
    console.log('Color changed:', color);
  }

  create(): void {
    this.isLoading = true;
    this.noteCreateSubscription && this.noteCreateSubscription.unsubscribe();
    this.noteCreateSubscription = this.labelService
      .createLabel({ ...this.label, priority: (this.labelsLength + 1) * 1000 })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.dialogRef.close();
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  chooseColor(color, name): void {
    this.label.color = color.color;
    this.label.name = name;
    this.label.font_color = color.font_color;
  }
}

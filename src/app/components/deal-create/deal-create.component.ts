import { Component, OnInit } from '@angular/core';
import { Contact } from 'src/app/models/contact.model';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss']
})
export class DealCreateComponent implements OnInit {
  contacts: Contact[] = [];
  title = '';
  submitted = false;
  saving = false;

  constructor(
    private dealsService: DealsService,
    private dialogRef: MatDialogRef<DealCreateComponent>
  ) {}

  ngOnInit(): void {}

  select(evt: any): void {
    console.log('###', evt);
  }

  create(): void {
    this.saving = true;
    const data = {
      title: this.title
    };
    this.dealsService.createStage(data).subscribe((res) => {
      if (res) {
        this.saving = false;
        this.dialogRef.close(res['data']);
      }
    });
  }
}

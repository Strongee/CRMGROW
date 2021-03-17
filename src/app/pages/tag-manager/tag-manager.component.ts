import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TagDeleteComponent } from 'src/app/components/tag-delete/tag-delete.component';
import { TagEditComponent } from 'src/app/components/tag-edit/tag-edit.component';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.scss']
})
export class TagManagerComponent implements OnInit {
  tags = [];
  loading = false;
  loadSubscription: Subscription;

  constructor(private dialog: MatDialog, private tagService: TagService) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadSubscription = this.tagService.tagLoad().subscribe((res) => {
      this.loading = false;
      if (res['status'] == true) {
        this.tags = res['data'];
        let data;
        for (let i = 0; i < this.tags.length; i++) {
          for (let j = 0; j < this.tags[i].contacts.length; j++) {
            if (this.tags[i].contacts[j].first_name == '') {
              data = {
                shortName: this.tags[i].contacts[j].last_name
                  .substring(0, 2)
                  .toUpperCase()
              };
            }
            if (this.tags[i].contacts[j].last_name == '') {
              data = {
                shortName: this.tags[i].contacts[j].first_name
                  .substring(0, 2)
                  .toUpperCase()
              };
            }
            if (
              this.tags[i].contacts[j].first_name != '' &&
              this.tags[i].contacts[j].last_name != ''
            ) {
              data = {
                shortName: (
                  this.tags[i].contacts[j].first_name.charAt(0) +
                  this.tags[i].contacts[j].last_name.charAt(0)
                ).toUpperCase()
              };
            }
            this.tags[i].contacts[j] = { ...this.tags[i].contacts[j], ...data };
          }
        }
      }
    });
  }

  editTag(editTag: any): void {
    this.dialog
      .open(TagEditComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          tagName: editTag._id
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          editTag._id = res;
        }
      });
  }

  deleteTag(deleteTag: any): void {
    this.dialog
      .open(TagDeleteComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          tagName: deleteTag._id
        }
      })
      .afterClosed()
      .subscribe((res) => {
        const tags = this.tags.filter((tag) => tag._id != res);
        this.tags = [];
        this.tags = tags;
      });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Garbage } from 'src/app/models/garbage.model';
import { User } from 'src/app/models/user.model';
import { LabelService } from 'src/app/services/label.service';
import { TagService } from 'src/app/services/tag.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  @ViewChild('drawer') manageLabelPanel: MatDrawer;

  constructor(
    private userService: UserService,
    private labelService: LabelService,
    private tagService: TagService
  ) {
    this.userService.loadProfile().subscribe((res) => {
      this.userService.setProfile(new User().deserialize(res));
      this.userService.setGarbage(new Garbage().deserialize(res['garbage']));
    });
    this.labelService.loadLabels();
    this.tagService.getAllTags();
    this.tagService.getAllCompanies();
    this.tagService.getAllSources();

    // Open or Close Manage Label
    this.labelService.manageLabel$.subscribe((flg) => {
      if (this.manageLabelPanel) {
        if (flg) {
          this.manageLabelPanel.open();
        } else {
          this.manageLabelPanel.close();
        }
      }
    });
  }

  ngOnInit(): void {}
}

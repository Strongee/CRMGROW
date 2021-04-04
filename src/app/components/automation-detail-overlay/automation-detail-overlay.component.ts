import { Component, Input, OnInit } from '@angular/core';
import { OverlayService } from 'src/app/services/overlay.service';
import { LabelService } from 'src/app/services/label.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-automation-detail-overlay',
  templateUrl: './automation-detail-overlay.component.html',
  styleUrls: ['./automation-detail-overlay.component.scss']
})
export class AutomationDetailOverlayComponent implements OnInit {
  @Input('dataSource') node;
  @Input('type') type;
  isShow = false;
  siteUrl = environment.website;
  user_id = '';
  profileSubscription: Subscription;

  constructor(
    private overlayService: OverlayService,
    public labelService: LabelService,
    private userService: UserService
  ) {
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user_id = profile._id;
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  update(): void {
    this.overlayService.close('edit');
  }

  remove(): void {
    this.overlayService.close('remove');
  }

  seeMore(): void {
    this.isShow = !this.isShow;
  }
}

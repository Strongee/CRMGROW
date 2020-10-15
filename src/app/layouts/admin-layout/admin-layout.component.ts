import { Component, OnInit } from '@angular/core';
import { Garbage } from 'src/app/models/garbage.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  constructor(private userService: UserService) {
    this.userService.loadProfile().subscribe((res) => {
      this.userService.setProfile(new User().deserialize(res));
      this.userService.setGarbage(new Garbage().deserialize(res['garbage']));
    });
  }

  ngOnInit(): void {}
}

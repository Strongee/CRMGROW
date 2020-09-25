import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthLayoutRoutes } from './auth-layout.routing.module';
import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { ForgotPasswordComponent } from '../../pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../pages/reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(AuthLayoutRoutes)]
})
export class AuthLayoutModule {}

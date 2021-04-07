import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthLayoutRoutes } from './auth-layout.routing.module';
import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { ForgotPasswordComponent } from '../../pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../pages/reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';
import { AuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';
import { environment } from 'src/environments/environment';
import { StripeModule } from 'stripe-angular';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    StripeModule.forRoot('pk_test_Fiq3VFU3LvZBSJpKGtD0paMK0005Q6E2Q2'),
    RouterModule.forChild(AuthLayoutRoutes)
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ]
})
export class AuthLayoutModule {}

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.ClientId.Google)
  }
]);

export function provideConfig(): any {
  return config;
}

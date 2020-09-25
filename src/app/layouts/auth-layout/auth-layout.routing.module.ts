import { Routes } from '@angular/router';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { RegisterComponent } from 'src/app/pages/register/register.component';

export const AuthLayoutRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Log in'
    }
  },
  {
    path: 'signup',
    component: RegisterComponent,
    data: {
      title: 'Sign Up'
    }
  }
];

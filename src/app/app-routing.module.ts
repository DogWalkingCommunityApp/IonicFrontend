import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import {PasswortVergessenComponent} from './passwort-vergessen/passwort-vergessen.component';
import { RegistrationComponent } from './registration/registration.component';
import { ProfileComponent} from './profile/profile.component';
import { ModalComponent } from './modal/modal.component';
import { EditProfilComponent} from './edit-profil/edit-profil.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent},
  { path: 'passwortVergessen', component: PasswortVergessenComponent},
  { path: 'registration', component: RegistrationComponent },
  { path: 'modal', component: ModalComponent},
  { path: 'editProfil', component: EditProfilComponent},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

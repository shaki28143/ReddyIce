
import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Login } from './login.component';
import { routing } from './login.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    routing,MaterialModule,ReactiveFormsModule,FormsModule,CommonModule
  ],
  declarations: [
    Login,
  ],
  providers: [],
})
export class LoginModule { }

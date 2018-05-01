import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Registration } from './registration.component';
import { NewUserRegistration } from './newUser/newuser.component';
import { RegistrationConfirmation } from './confirmation/registrationConfirmation.component';
import { routing } from './registration.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [
    routing,MaterialModule,ReactiveFormsModule,CommonModule,FlexLayoutModule
  ],
  declarations: [
    Registration,
    NewUserRegistration,
    RegistrationConfirmation
  ],
  providers: [],
})
export class RegistrationModule { }

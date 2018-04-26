import { CommonModule } from '@angular/common';  
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { NewUser } from './newuser.component';
import { routing } from './newuser.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [
    routing,MaterialModule,ReactiveFormsModule,CommonModule,FlexLayoutModule
  ],
  declarations: [
    NewUser
  ],
  providers: [],
})
export class NewUserModule { }

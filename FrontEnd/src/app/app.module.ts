import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from "./material-module";
import { RegisterService } from "./user.service";
import { HttpClientModule } from '@angular/common/http'; import { HttpModule } from '@angular/http';
import { FileUploadModule } from "ng2-file-upload";
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    UserComponent
  ],
  imports: [
    FileUploadModule,
    DemoMaterialModule,
    BrowserModule,
    HttpClientModule,
        AppRoutingModule,
    ReactiveFormsModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [RegisterService],
  bootstrap: [AppComponent]
})
export class AppModule { }

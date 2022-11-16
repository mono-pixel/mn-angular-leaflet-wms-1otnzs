import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import { HttpClientModule } from "@angular/common/http";
import { WMSService } from './wms.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, LeafletModule.forRoot(), HttpClientModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  providers: [WMSService]
})
export class AppModule { }

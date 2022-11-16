import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class WMSService {
  API =
    "https://geo.weather.gc.ca/geomet/?lang=en&service=WMS&request=GetCapabilities&version=1.3.0&LAYERS=RADAR_1KM_RSNO";

  constructor(private httpClient: HttpClient) {}

  getRadarTime() {
    return this.httpClient.get(this.API, {responseType: 'text'});
  }
}

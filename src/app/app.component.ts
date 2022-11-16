import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import { WMSService } from "./wms.service";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  options = {
    layers: [
      L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 3,
    center: L.latLng(56.1304, -106.3468)
  };
  parser = new DOMParser();
  radarDates;
  currentTime;

  timeLayers = [];
  isPlaying: boolean;
  timeLayerIndex: 0;
  map: L.Map;
  isShowRadar = false;
  transitionMs = 750;
  showOpacityValue = 0.57;
  wmsURL = "https://geo.weather.gc.ca/geomet/";
  wmsOptions = {
    layers: "RADAR_1KM_RRAI",
    format: "image/png",
    opacity: 0,
    transparent: true,
    zIndex: 2,
    version: "1.3.0"
  };

  constructor(private wmsService: WMSService) {}

  getRadarStartEndTime() {
    this.wmsService.getRadarTime().subscribe(response => {
      const data = this.parser
        .parseFromString(response, "text/xml")
        .getElementsByTagName("Dimension")[0]
        .innerHTML.split("/");

      this.radarDates = [new Date(data[0]), new Date(data[1])];

      this.setCurrentTime();
      this.generateLayers();
    });
  }

  setCurrentTime() {
    if (!this.currentTime) {
      this.currentTime = this.radarDates[0];
    } else if (this.currentTime >= this.radarDates[1]) {
      this.currentTime = this.radarDates[0];
    } else {
      this.currentTime = new Date(
        this.currentTime.setMinutes(this.currentTime.getMinutes() + 10)
      );
    }
  }

  toggleRadar() {
    this.isShowRadar = !this.isShowRadar;
    if (this.isShowRadar) {
      this.isPlaying = false;
      this.getRadarStartEndTime();
    } else {
      this.currentTime = new Date(this.radarDates[0]);
      this.removeLayers();
    }
  }

  toggleRadarPlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.isPlaying = true;
      this.timeLayerIndex = 0;
      this.setTransitionTimer();
    }
  }

  hideLayerByIndex(index) {
    this.timeLayers[index].setOpacity(0);
  }

  showLayerByIndex(index) {
    this.timeLayers[index].setOpacity(this.showOpacityValue);
  }

  incrementLayerIndex() {
    this.timeLayerIndex++;
    if (this.timeLayerIndex > this.timeLayers.length - 1) {
      this.timeLayerIndex = 0;
    }
  }

  removeLayers() {
    this.timeLayers.forEach(timeLayer => timeLayer.removeFrom(this.map));
    this.timeLayers = [];
    this.timeLayerIndex = 0;
  }

  setTransitionTimer() {
    if (this.timeLayerIndex > this.timeLayers.length - 1 || !this.isPlaying) {
      return;
    }
    setTimeout(() => {
      this.timeLayers.forEach(timeLayer => {
        timeLayer.setOpacity(0);
        timeLayer.addTo(this.map);
      });

      if (this.isShowRadar) {
        this.hideLayerByIndex(this.timeLayerIndex);
        this.incrementLayerIndex();
        this.showLayerByIndex(this.timeLayerIndex);
        this.setCurrentTime();
        this.setTransitionTimer();
      } else {
        this.removeLayers();
      }
    }, this.transitionMs);
  }

  generateLayers() {
    let date = new Date(this.radarDates[0]);
    while (date < new Date(this.radarDates[1])) {
      const layer = L.tileLayer.wms(this.wmsURL, this.wmsOptions);

      date = new Date(date.setMinutes(date.getMinutes() + 10));

      layer.setParams({
        time: date.toISOString().split(".")[0] + "Z"
      });
      this.map.addLayer(layer);
      this.timeLayers.push(layer);
    }

    this.timeLayers[0].setOpacity(this.showOpacityValue);
  }

  onMapReady(map: L.Map) {
    this.map = map;

    const radarButton = L.DomUtil.create("button");
    const radarControl = new L.Control();
    radarControl.options = { position: "bottomright" };
    radarControl.onAdd = () => {
      radarButton.innerText = "Show Radar";
      return radarButton;
    };
    radarButton.onclick = () => {
      this.toggleRadar();
      radarButton.innerText = this.isShowRadar ? "Hide Radar" : "Show Radar";
    };

    map.addControl(radarControl);
  }

  ngOnInit() {}
}

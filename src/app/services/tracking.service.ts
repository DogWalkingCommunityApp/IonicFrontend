import { Injectable } from '@angular/core';
import { MapCoordinates } from './../map/map.interfaces';
import { DEVICE_ORIENTATION, TRACKING_USERS_ARRAY } from './../constants';
import { BehaviorSubject } from 'rxjs';
import { DataStoreService } from './data-store.service';
import { Socket } from 'ngx-socket-io';
import { WorkerFilteredData, IWorkerMessage } from './tracking';
export const CALC_ORIENTATION_CHANGE = 'calculateCompassHeading';

type TrackingCallback = (coords: MapCoordinates) => void;

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private watchLocationId: number;
  private trackingCallbacks: { [key: string]: TrackingCallback} = {};
  private socketReady: boolean = false;
  public coordinates: MapCoordinates;
  private serverTrackingInterval: any;
  private worker: Worker;
  private jump: boolean = false;
  private _range: number = 5;
  
  public compass: BehaviorSubject<number> = new BehaviorSubject(0);
  public filteredTrackingData: BehaviorSubject<WorkerFilteredData> = new BehaviorSubject(null);
  public trackingActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private dataStore: DataStoreService, private socket: Socket) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker('./tracking.worker', { type: 'module' });
      this.worker = worker;

      worker.onmessage = ({ data }) => {
        this.workerReducer(data);
      };

      if (dataStore.authToken) {
        socket.emit('authenticateSocket', dataStore.authToken);
      }

      window.addEventListener('deviceorientation', (event) => {
        const { alpha, beta, gamma } = event;
        worker.postMessage({ type: CALC_ORIENTATION_CHANGE, orientationData: { alpha, beta, gamma } });
      })
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

    // Register a route which should allow to listen for the authentification response
    this.registerSocketRoutes(socket);
   }

   public startTracking(callback: TrackingCallback, callee: string): void {
    if (navigator.geolocation) {
      if (!this.watchLocationId) {
        this.addCallback(callback, callee);
      
        this.watchLocationId = navigator.geolocation.watchPosition((geoLocation: Position) => { 
            const coords: MapCoordinates = { lat: geoLocation.coords.latitude, lng: geoLocation.coords.longitude };
            this.coordinates = coords;
            this.runCallbacks(coords);
          })
      } else {
        this.addCallback(callback, callee);
      }
    } else {
      throw new Error('Geolocation API not supported');
    }
   }

   public stopTracking(): void {
     navigator.geolocation.clearWatch(this.watchLocationId);
     this.watchLocationId = undefined;
   }

   // Functions used to register and unregister from the location tracking for any other component
   private addCallback(callback: TrackingCallback, callee: string): void {
      if (!this.trackingCallbacks[callee]) {
        this.trackingCallbacks[callee] = callback;
      }
   }

   private runCallbacks(coords: MapCoordinates): void {
    for (let callback of Object.values(this.trackingCallbacks)) {
      callback(coords);
    }
   }

   private removeCallback(callee: string): void {
     if (this.trackingCallbacks[callee]) {
       delete this.trackingCallbacks[callee];
     }
   }

   // <----------------------------------------------------------------------------------------------->

   // Reducer for the Web Worker
   private workerReducer(message: IWorkerMessage): void {
    switch(message.type) {
      case DEVICE_ORIENTATION:
        this.compass.next(message.heading);
        break;
      case TRACKING_USERS_ARRAY:
        this.jump = message.data.jump;
        this.filteredTrackingData.next(message.data);
        this.dataStore.availableUsersData = message.data;
        break;
    }
   }

   private registerSocketRoutes(socket: Socket) {
    socket.on('authenticateSocket', (status) => {
      if (status.success) {
        this.socketReady = true;
      }
    })

    socket.on('trackLocationArray', (data) => {
      const { trackingArray, gpsKey } = data;
      this.worker.postMessage({ type: TRACKING_USERS_ARRAY, data: { trackingArray, coordinates: this.coordinates, range: this._range, gpsKey } })
    })
   }

   // Server sided tracking functionality
   public activateServerTracking(): void {
    this.serverTrackingInterval = setInterval(() => {
      if (this.socketReady && this.coordinates) {
        const { lat, lng } = this.coordinates;
        const jumpCell = this.jump;

        if(jumpCell) {
          this.jump = false;
        }

        this.socket.emit('trackLocation', { lat, lng, jumpCell, range: Math.floor(this._range/2) });
      }
    }, 1000)

    this.trackingActive.next(true);
   }

   public deActivateServerTracking(): void {
     clearInterval(this.serverTrackingInterval);
     this.socket.emit('stopTracking');
     this.trackingActive.next(false);
   }


   // Getter/Setter
   set range(value: number) {
     this._range = value;
   }

   get range():number {
    return this._range;
  }
}
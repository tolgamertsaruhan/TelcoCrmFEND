import { Injectable, signal } from '@angular/core';
 
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = signal<boolean>(false);
 
  private requestCount:number=0;
 
  addRequest(){
    this.requestCount++;
    this.isLoading.set(this.requestCount > 0);
  }
 
  removeRequest(){
    this.requestCount--;
    if(this.requestCount < 0){
      this.requestCount = 0;
    }
    this.isLoading.set(this.requestCount > 0);
  }
}
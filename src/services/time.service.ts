import { Injectable } from "@angular/core";
import { Observable, of, timer } from "rxjs";
import { delay, filter, map, shareReplay, startWith, takeWhile, withLatestFrom } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class TimeService {
    
}
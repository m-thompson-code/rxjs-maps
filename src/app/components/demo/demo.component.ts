import { Component, Input, OnInit } from "@angular/core";
import { Observable, of, Subject, timer } from "rxjs";
import { concatMap, delay, exhaustMap, filter, map, mergeMap, shareReplay, startWith, switchMap, takeUntil, takeWhile, tap, withLatestFrom } from "rxjs/operators";
import { CONCAT_COLOR, DEFAULT_COLOR, EXHAUST_COLOR, LIMIT, MERGE_COLOR, PULSE_TIMEOUT, SWITCH_COLOR, TICK, TICK_PER_HALF_SECOND } from "src/app/app.component";
import { Pulse } from "../pulses/pulses.component";

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss']
  })
  export class DemoComponent implements OnInit {
    @Input() demo!: {
        demoMergeMap: boolean;
        demoSwitchMap: boolean;
        demoExhaustMap: boolean;
        demoConcatMap: boolean;
    };
    
    mergeMapPulses: Pulse[] = [];
    switchMapPulses: Pulse[] = [];
    exhaustMapPulses: Pulse[] = [];
    concatMapPulses: Pulse[] = [];
    
    _tick$  = timer(TICK, TICK).pipe(
        map((timerIndex) => timerIndex + 1),
        takeWhile((x) => x <= LIMIT * TICK_PER_HALF_SECOND - 1),
        shareReplay(1),
        startWith(0)
    );

    moment$ = this._tick$.pipe(
        filter(x => x % (TICK_PER_HALF_SECOND) === 0), map(tick => tick / TICK_PER_HALF_SECOND),
        takeWhile((x) => x <= 10)
    );

    unsub$ = new Subject<void>();

    ngOnInit(): void {
        this.moment$
        .pipe(takeUntil(this.unsub$))
        .subscribe(x => console.log('_seconds', x));

        this.moment$
            .pipe(
                tap((second) => this.mergeMapPulses.push(this.getPulse(DEFAULT_COLOR, second))),
                mergeMap((second) => this.pulse(`MERGE_MAP`, second)),
                tap(({ start }) => this.mergeMapPulses.push(this.getPulse(MERGE_COLOR, start))),
                takeUntil(this.unsub$)
            )
            .subscribe();
        
        this.moment$
            .pipe(
                tap((second) => this.switchMapPulses.push(this.getPulse(DEFAULT_COLOR, second))),
                switchMap((second) => this.pulse(`SWITCH_MAP`, second)),
                tap(({ start }) => this.switchMapPulses.push(this.getPulse(SWITCH_COLOR, start))),
                takeUntil(this.unsub$)
            )
            .subscribe();

        this.moment$
            .pipe(
                tap((second) => this.exhaustMapPulses.push(this.getPulse(DEFAULT_COLOR, second))),
                exhaustMap((second) => this.pulse(`EXHAUST_MAP`, second)),
                tap(({ start }) => this.exhaustMapPulses.push(this.getPulse(EXHAUST_COLOR, start))),
                takeUntil(this.unsub$)
            )
            .subscribe();

        this.moment$
            .pipe(
                tap((second) => this.concatMapPulses.push(this.getPulse(DEFAULT_COLOR, second))),
                concatMap((second) => this.pulse(`CONCAT_MAP`, second)),
                tap(({ start }) => this.concatMapPulses.push(this.getPulse(CONCAT_COLOR, start))),
                takeUntil(this.unsub$)
            )
            .subscribe();
    }

    getPulse(color: string, second: number): Pulse {
        return {
            color,
            left: `${100 * second / (LIMIT - 1)}%`,
            top: '0',
        };
    }

    pulse(label: string, start: number): Observable<{start: number, label: string, end: number}> {
        return of(label).pipe(
            delay(PULSE_TIMEOUT),
            withLatestFrom(this.moment$), 
            map(([_label, end]) => ({
                label: _label, start, end,
            })),
            tap(x => console.log(x)),
        );
    }
}

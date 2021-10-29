import { Component, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ObservableInput, of, OperatorFunction, merge, Subject } from 'rxjs';
import { concatMap, delay, exhaustMap, filter, map, mergeMap, startWith, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { Pulse } from './components/pulses/pulses.component';

export const TICK = 50;
export const HALF_SECOND = 500;
export const TICK_PER_HALF_SECOND = HALF_SECOND / TICK;
export const LIMIT = 7;
export const PULSE_TIMEOUT = HALF_SECOND * 2;

export const DEFAULT_COLOR = 'lightgrey';
export const MERGE_COLOR = 'green';
export const SWITCH_COLOR = 'red';
export const EXHAUST_COLOR = 'blue';
export const CONCAT_COLOR = 'purple';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  pulses: Pulse[] = [];
  mergeMapPulses: Pulse[] = [];

  pulse$ = new Subject<Pulse>();
  
  unsub$ = new Subject<void>();

  showDemo = true;

  form = this.fb.group({
    demoMergeMap: true,
    demoSwitchMap: false,
    demoExhaustMap: false,
    demoConcatMap: false,
  });

  clickForm = this.fb.group({
    click: 'mergeMap',
  })

  demo$ = this.form.valueChanges.pipe(startWith({
    demoMergeMap: true,
    demoSwitchMap: false,
    demoExhaustMap: false,
    demoConcatMap: false,
  }));

  constructor(private renderer: Renderer2, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      tap(() => {
        this.showDemo = false;
        setTimeout(() => {
          this.showDemo = true;
        }, 0);
      }),
      takeUntil(this.unsub$),
    ).subscribe();

    this.renderer.listen(document.body, 'click', (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (this.clickedInput(element)) {
        return;
      }
      const x = innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const y = innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;

      const pulse = {
        left: `${100 * (event.clientX / x)}%`,
        top: `${100 * (event.clientY / y)}%`,
        color: 'grey',
      };

      this.pulse$.next(pulse);
    });

    this.pulse$.pipe(
      tap(pulse => this.pulses.push(pulse)), takeUntil(this.unsub$),
    ).subscribe();

    const mergePulse$ = this.pulse$.pipe(
      filter(() => this.clickForm.controls.click.value === 'mergeMap'),
      mergeMap(pulse => of(pulse).pipe(delay(PULSE_TIMEOUT))),
      map(pulse => ({...pulse, color: MERGE_COLOR}))
    );

    const switchPulse$ = this.pulse$.pipe(
      filter(() => this.clickForm.controls.click.value === 'switchMap'),
      switchMap(pulse => of(pulse).pipe(delay(PULSE_TIMEOUT))),
      map(pulse => ({...pulse, color: SWITCH_COLOR}))
    );

    const exhaustPulse$ = this.pulse$.pipe(
      filter(() => this.clickForm.controls.click.value === 'exhaustMap'),
      exhaustMap(pulse => of(pulse).pipe(delay(PULSE_TIMEOUT))),
      map(pulse => ({...pulse, color: EXHAUST_COLOR}))
    );

    const concatPulse$ = this.pulse$.pipe(
      filter(() => this.clickForm.controls.click.value === 'concatMap'),
      concatMap(pulse => of(pulse).pipe(delay(PULSE_TIMEOUT))),
      map(pulse => ({...pulse, color: CONCAT_COLOR}))
    );

    merge(
      mergePulse$,
      switchPulse$,
      exhaustPulse$,
      concatPulse$
    ).pipe(
      tap(pulse => this.pulses.push(pulse)),
      takeUntil(this.unsub$),
    ).subscribe();
  }


  clickedInput(element: HTMLElement): boolean {
    if (element.tagName === 'INPUT' || element.className.includes('mat')) {
      return true;
    }

    if (element.parentElement) {
      return this.clickedInput(element.parentElement);
    }

    return false;
  }

  getColor() {
    if (this.clickForm.controls.click.value === 'mergeMap') {
      return MERGE_COLOR;
    }
    if (this.clickForm.controls.click.value === 'switchMap') {
      return SWITCH_COLOR;
    }
    if (this.clickForm.controls.click.value === 'exhaustMap') {
      return EXHAUST_COLOR;
    }
    return CONCAT_COLOR;
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }
}

import { Component, Input } from "@angular/core";

export interface Pulse {
    left: string;
    top: string;
    color: string;
}

@Component({
    selector: 'app-pulses',
    templateUrl: './pulses.component.html',
    styleUrls: ['./pulses.component.scss']
})
export class PulsesComponent {
    @Input() pulses: Pulse[] = [];
}
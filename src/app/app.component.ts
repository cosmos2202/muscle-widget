import { Component } from '@angular/core';
import { ChartConfiguration } from './muscleman/models/chart-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'widget';

  chartConfiguration: ChartConfiguration

  constructor() {
    this.chartConfiguration = new ChartConfiguration()
  }
}

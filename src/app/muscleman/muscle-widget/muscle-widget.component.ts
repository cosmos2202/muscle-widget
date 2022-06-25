import { Component, HostListener, Input, OnInit } from '@angular/core'
import { Chart } from 'angular-highcharts'
import { SeriesOptionsType } from 'highcharts';
import { forkJoin, timer } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators'
import { ChartConfiguration } from '../models/chart-model';
import { MuscleWidgetService } from '../muscle-service/muscle-widget.service';


@Component({
  selector: 'muscle-widget',
  templateUrl: './muscle-widget.component.html',
  styleUrls: ['./muscle-widget.component.scss']
})
export class MuscleWidgetComponent implements OnInit {

  group: any
  label1: any
  label2: any
  width1: number = 0
  width2: number = 0
  @Input('chartConfig') chartConfig:ChartConfiguration

  @HostListener('window:resize', ['$event'])
  resizeWindow(): void {
    this.width1 = (window.innerWidth - this.chartConfig.primaryPercentageLabelXPosition)
    this.width2 = (window.innerWidth - this.chartConfig.secondaryPercentageLabelXPosition)

    if (this.group) {
      this.label1.attr('translateX', this.width1)
      this.label2.attr('translateX', this.width2)
    }

  }

  chartsData: SeriesOptionsType[] = []
  chart: Chart

  constructor(private muscleWidgetService: MuscleWidgetService) {
  }
 
  ngOnInit() {

    this.setupChart()

    this.width1 = (window.innerWidth - this.chartConfig.primaryPercentageLabelXPosition)
    this.width2 = (window.innerWidth - this.chartConfig.secondaryPercentageLabelXPosition)

    let a$ = this.muscleWidgetService.getCurrencyData(this.chartConfig.coin)
    let b$ = this.muscleWidgetService.getChartData(this.chartConfig.days, this.chartConfig.points, this.chartConfig.coin)
    let all$ = forkJoin([a$, b$])
    timer(0, this.chartConfig.refreshRateMs).pipe(mergeMap(() => all$),
    tap(chartModel => {
        const data = []
        for (const value of chartModel[1].data) {
          data.push([value.date, value.rate])
        }
        this.chartsData = [
          {type: 'area', name: this.chartConfig.dataSeriesName, data}
        ]
        if (this.chart && this.chart.ref.series) {
          while (this.chart.ref.series.length > 0)
            this.chart.ref.series[0].remove(false)
        }
        
        this.chart.addSeries(this.chartsData[0], true, true)

        let price = chartModel[0].data[0].price
        let FV = data[data.length - 1][1]
        let IV = data[data.length - this.chartConfig.points - 1][1]
        let priceChange = (FV - IV) / IV * 100
        let btc = chartModel[0].data[0].price / chartModel[0].data[1].price
        let btcChange = 0

        if (!this.group) {
          this.group = this.chart.ref.renderer.g('customLabels')
          this.group.renderer.image(this.chartConfig.imageLocation, this.chartConfig.imageXPosition, this.chartConfig.imageYPosition, this.chartConfig.imageHeight, this.chartConfig.imageWidth).add()
          this.group.renderer.label(this.chartConfig.coin, this.chartConfig.coinXPosition, this.chartConfig.coinYPosition).css(this.chartConfig.coinStyle).add()
          this.group.renderer.label(this.chartConfig.coinName, this.chartConfig.coinNameXPosition, this.chartConfig.coinNameYPosition).css(this.chartConfig.coinNameStyle).add()
          this.label1 = this.group.renderer.label(`$ ${price.toFixed(this.chartConfig.primaryDecimalPlaces)}  ${priceChange.toFixed(this.chartConfig.primaryPercentDecimalPlaces)}%`, this.width1, this.chartConfig.primaryPercentageLabelYPosition).css(this.chartConfig.primaryPercentageLabelStyle).add()
          this.label2 = this.group.renderer.label(`B ${btc.toFixed(this.chartConfig.secondaryDecimalPlaces)}    ${btcChange.toFixed(this.chartConfig.secondaryPercentDecimalPlaces)}%`, this.width2, this.chartConfig.secondaryPercentageLabelYPosition).css(this.chartConfig.secondaryPercentageLabelStyle).add()
        }
        else {
          this.label1.attr({text: `$ ${price.toFixed(this.chartConfig.primaryDecimalPlaces)}  ${priceChange.toFixed(this.chartConfig.primaryPercentDecimalPlaces)}%`})
          this.label2.attr({text: `B ${btc.toFixed(this.chartConfig.secondaryDecimalPlaces)}    ${btcChange.toFixed(this.chartConfig.secondaryPercentDecimalPlaces)}%`})
        }
    }))
    .subscribe()
  }

  setupChart()
  {
    this.chart = new Chart({
      chart: {
        backgroundColor: this.chartConfig.backgroundColor,
        type: 'line'
      },
      accessibility: {
        enabled: false
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      },
      series: this.chartsData,
      xAxis: {
        lineWidth: 0,
        gridLineWidth: 0,     
        type: 'datetime',
        ordinal: true,
        labels: {
          enabled: false,
          style: this.chartConfig.xAxisStyle
        },
        title: {
          text: this.chartConfig.xAxisText,
          style: this.chartConfig.xAxisStyle
        }
      },
      colors: this.chartConfig.colors,
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      yAxis: {
        lineWidth: 0,
        floor: 0,
        labels: {
          enabled: false
        },
        title: {
          text: this.chartConfig.yAxisText,
          style: this.chartConfig.yAxisStyle
        }
      },
      navigator: {enabled: true},
      responsive: {
        rules: [
            {
                condition: {
                    maxWidth: 575
                },
                chartOptions: {
                    chart: {
                        width: 575
                    },
                    rangeSelector: {
                        inputPosition: {
                            align: 'left'
                        }
                    }
                }
            }
        ]
      }
    })
  }
}

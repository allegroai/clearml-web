import { FilterMonitorMetricPipe } from './filter-monitor-metric.pipe';

describe('FilterMonitorMetricPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterMonitorMetricPipe();
    expect(pipe).toBeTruthy();
  });

  it('create filters monitor', () => {
    const pipe = new FilterMonitorMetricPipe();
    const data = [
      {
        key: "028d9091618657f296222d768c3dd9b8",
        value: {
          "metric": ":monitor:machine",
          "variant": "network_rx_mbs",
          "value": 0.008,
          "min_value": 0.008,
          "max_value": 0.008
        }
      },
      {
        key: "1a760266c35f86529f9c669d539a2297",
        value: {
          "metric": ":monitor:machine",
          "variant": "io_read_mbs",
          "value": 0.087,
          "min_value": 0.087,
          "max_value": 0.087
        }
      },
      {
        key: "1a760266c35f86529f9c669d539a2299",
        value: {
          "metric": "ok",
          "variant": "io_read_mbs",
          "value": 0.087,
          "min_value": 0.087,
          "max_value": 0.087
        }
      }

    ];
  expect(pipe.transform(data).length).toBe(1);
  });
});

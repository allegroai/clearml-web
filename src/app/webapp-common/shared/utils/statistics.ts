import {last, getOr, flattenDeep} from 'lodash/fp';

export interface DataPoint {
  date: string;
  value: number;
}

export interface Topic {
  topicName: string;
  topicID?: string;
  topic: number;
  dates: DataPoint[];
}

export interface RequestParam {
  key: string;
  aggregation?: string;
}

const defaultMaxValHandler = {
  get: function (target: object, name: string) {
    if (!target.hasOwnProperty(name)) {
      target[name] = Math.max(...(Object.values(target) as number[]), 0) + 1;
    }
    return target[name];
  }
};

export function addStats(current: Topic[], data, maxPoints: number,
  requestedKeys: RequestParam[],
  entityParamName: string,
  paramInfo: {
    [key: string]: {
      title: string;
      multiply: number;
    };
  }) {
  const topicIDs = new Proxy({}, defaultMaxValHandler);
  let dataByTopic: Topic[];
  if (current) {
    current.forEach(topicObj => topicIDs[topicObj.topicID] = topicObj.topic);
    dataByTopic = current.slice();
  } else {
    dataByTopic = [];
  }

  const allDates = [...new Set(flattenDeep(data.map(d => d.metrics ? d.metrics.map((topic: Topic) => topic.dates) : [])))] as number[];
  const shouldAddEntity = data.length > 1;
  data.forEach(entityData => {
    const entity = entityData[entityParamName];
    requestedKeys.forEach(reqKey => {
      const paramData = entityData.metrics.find(metric => metric.metric === reqKey.key);
      if (!paramData) {
        return;
      }
      const dates: number[] = paramData.dates;
      const param = paramData.metric;
      paramData.stats.forEach(aggData => {
        const aggregation = aggData.aggregation;
        const topicID     = `${entity} ${param} ${aggregation}`;
        const topicName   = `${paramInfo[param].title} (${aggregation})${shouldAddEntity && entity ? ' for ' + entity : ''}`;
        let topic: Topic = dataByTopic.find(topic => topic.topicID === topicID);
        if (!topic) {
          topic = {topicName, topicID, topic: topicIDs[topicID], dates: [] as DataPoint[]};
          dataByTopic.push(topic);
        }
        const tplList = allDates
          .filter(date => {
            if (topic.dates.length === 0) {
              return true;
            }
            const strDate: string = new Date(date as number).toISOString();
            return topic.dates.findIndex(dateObj => dateObj.date === strDate) < 0;
          })
          .map(date => {
            const idx = dates.indexOf(date);
            return {
              date : new Date(date as number).toISOString(),
              value: idx > -1 ? aggData.values[idx] * paramInfo[param].multiply : null
            };
          });
        topic.dates.push(...tplList);
        topic.dates = topic.dates.slice(Math.max(topic.dates.length - maxPoints, 0));
      });
    });
    // add missing keys
    requestedKeys.forEach(reqParam => {
      const item = dataByTopic.find((topic: Topic) => topic.topicID.indexOf(reqParam.key) > -1);
      if (!item) {
        const topicID   = `${entity} ${reqParam.key} avg`;
        const topicName = `${paramInfo[reqParam.key].title} (avg) ${shouldAddEntity && entity ? 'for ' + entity : ''}`;
        const topic     = {topicName: topicName, topicID: topicID, topic: topicIDs[topicID], dates: [] as DataPoint[]};
        dataByTopic.push(topic);
      }
    });
  });
  return dataByTopic;
}

export function getLastTimestamp(data: Topic[]): number {
  let lastDate = 0;
  data.forEach(topic => {
    const dates = topic.dates;
    if (dates) {
      const topicLastDate = getOr(0, 'date', last(dates));
      const date          = Math.floor((new Date(topicLastDate)).getTime() / 1000);
      lastDate            = Math.max(lastDate, date);
    }
  });
  return lastDate;
}

export function removeFullRangeMarkers(topics: Topic[]) {
  const dates = topics[0].dates;
  if (dates.slice(-1)[0].value === null) {
    dates.splice(-1, 1);
  }
  if (dates[0].value === null) {
    dates.splice(0, 1);
  }
}

export function addFullRangeMarkers(topics: Topic[], fromDate: number, toDate: number) {
  topics[0].dates.splice(0, 0, {date: (new Date(fromDate * 1000)).toISOString(), value: null});
  topics[0].dates.push({date: (new Date(toDate * 1000)).toISOString(), value: null});
}

# example

## setup

```javascript
  import {TableDiffModule} from "al-ui-components";
  
  ...
```

## example of description:

some description of the component

### Inputs

|     parameter     |     type       |   default value   |   description              |
|-------------------|----------------|-------------------|----------------------------|
|     keyValueArray     |     Array<IkeyValue>       |   -               |   some description         |
|     isOrigin     |     boolean       |   -               |   some description         |
|     keyTitle     |     string       |   -               |   some description         |
|     valueTitle     |     string       |   -               |   some description         |


### Outputs

|     parameter     |     type       |   default value   |   description              |
|-------------------|----------------|-------------------|----------------------------|
|     sortChanged     |     string       |   -               |   some description         |


## example of code:

```javascript
metricValues1 = [{key: 'bannana', value: 0.98},{variant: 'cat', value: 0.98}];
```
```html
      <al-table-diff [keyValueArray]="metricValues1"  keyTitle="VARIANT" valueTitle="VALUE"></al-table-diff>
```

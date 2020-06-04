# Collapse Component

## Setup

```javascript
  import {CollapseModule} from 'al-ui-components';
  
  ...
```

## Description:

A collapsible content container.

### Inputs

|     parameter     |     type       |   default value   |   description               |
|-------------------|----------------|-------------------|-----------------------------|
|     expanded      |     boolean    |   false           |   determine collapsed state |
|     header        |     string     |   null            |   collapsed header title    |
|     headerClass   |     string     |   null            |   collapsed header css class|
|     disabled      |     boolean    |   false           |   determine disabled state  |
|     header-content|     ngContent  |   -               |   a slot for custom header content   |

### Outputs

|     parameter     |     type       |   default value   |   description              |
|-------------------|----------------|-------------------|----------------------------|
|  collapseToggled  |     boolean    |   -               |   emit on collapsed event  |


## Simple code:

```html
  <al-collapse 
    header="Collapsed Title" 
    [expanded]="isCollapsed"
    
    (collapseToggled)="collapsedToggled($event)" 
  >

    <div>
  
      <div>Some very long text...</div>
  
    </div>
  
  </al-collapse>
```

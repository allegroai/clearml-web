# example

## setup

```javascript
  import DrawerModule from "ui-components";
  
  ...
```

## example of description:

some description of the component

### Inputs

|     parameter     |     type       |   default value   |   description              |
|-------------------|----------------|-------------------|----------------------------|
|     label         |     string     |   ''              |   Text to be displayed when drawer is closed         |
|     displayOnHover         |     boolean     |   false              |   Should the drawer toggle button be visible on hover mode         |

## example of code:

```html
  <al-drawer label="Every thing is awesome" [displayOnHover]="true">
   <div>Put your content here</div>
   </al-drawer>
```


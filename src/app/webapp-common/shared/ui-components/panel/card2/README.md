# example

## setup

```javascript
  import CardModule from "ui-components";
  
  ...
```

## example of description:

A styled container for pieces of itemized content. 

### Inputs

|     parameter     |     type       |   default value   |   description              |
|-------------------|----------------|-------------------|----------------------------|
|     header        |     string     |   -               |   the card header          |
|     text          |     string     |   -               |   the card body text       |
|     showBorder    |     boolean    |   false           |   showing card border      |

## example of code:

```html
  <sm-card2 header="Card Header" [showBorder]="true"> 
      <div header-content>
      
        some header content...
      </div>
      
        some body content...
      <div footer>
      
        some footer content...
      </div>
      
  </sm-card2>
```


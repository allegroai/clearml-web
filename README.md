# ClearML Webapp

## Building the UI from source
### Prerequisite
* a linux machine
* Node 12 with latest npm
* clone the project to your local machine

### Build
* cd to the root of the project
* run `npm ci` to install required node modules
* (optionally) update src/environment/environment.prod.ts with the API server URL
* run `npm run build`

### Serving the web application
* the product of the build phase should be located in the build folder. it should be served with a web server (e.g. nginx, httpd)

## Application Structure

#### Business Logic module
Contains ClearML logic. api calls and ClearML objects (e.g tasks, models) as well as ClearML logic function (e.g isTaskHidden)

#### Core module
Contains only logic. no declarations. no dependency with any other module beside ngrx.
* **services** - utilities classes. file name: `<name>.service.ts`

#### Feature Modules
Application feature modules. each module can contain declarations and providers **specific to the the feature**  
Depend only on shared module for ui components

##### Each feature can contain the following: 
* **module** - the feature module: `<featureName>.module.ts`. 
* **component** - the feature main component js file, should contain the feature's containers components only: `<featureName>.component.ts`. 
* **component** html - the feature component html: `<featureName>.component.html`. 
* **component** style - the feature component style: `<featureName>.component.scss`.
* **utils** - the feature utils, a page with list of pure functions for utils purposes: `<featureName>.utils.ts`.
* **constants** - the feature constants values: `<featureName>.const.ts`. 
* **model** - the feature types, interfaces and objects declarations: `<featureName>.model.ts`.
* **actions** - redux action classes - file name: `<name>.actions.ts`
* **effects** - ngrx effects classes. manage data flow and side effects - file name: `<name>.effect.ts`
* **reducers** - simple functions for state composition. file name: `<name>
.reducer.ts`
* **services** - utilities classes with the same responsibility under `services` folder : `<name>.service.ts`.
* **container components** - components that will include dumb components and will pass data from the state to the dumb components and dispatch actions of the dumb components, the container components will be under `containers` folder.
* **dumb components** - stateless view components that will communicate through inputs and outputs, the dumb components will be under `dumb` folder. 

#### Shared Module
Application shared UI components, directives and pipes. **contain only declarations**.
All the components should be **reusable**.


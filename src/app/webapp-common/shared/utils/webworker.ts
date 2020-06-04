import 'reflect-metadata';
import {from, Observable} from 'rxjs';


export class CreateWebWorker {

  private promiseToWorkerMap: WeakMap<Promise<any>, Worker>;
  private workerFunctionToUrlMap: WeakMap<Function, string>;

  constructor() {
    this.promiseToWorkerMap     = new WeakMap<Promise<any>, Worker>();
    this.workerFunctionToUrlMap = new WeakMap<Function, string>();
  }

  public run<T>(workerFunction: (input: any) => T, data?: any): Promise<T> {
    const url: string = this.getOrCreateWorkerUrl(workerFunction);
    return this.runUrl(url, data);
  }

  public runUrl(url: string, data?: any): Promise<any> {
    const worker         = new Worker(url);
    const promise        = this.createPromiseForWorker(worker, data);
    const promiseCleaner = this.createPromiseCleaner(promise);

    this.promiseToWorkerMap.set(promise, worker);

    return promise.then(promiseCleaner)
      .catch(promiseCleaner);
  }

  public terminate<T>(promise: Promise<T>): Promise<T> {
    return this.removePromise(promise);
  }

  public getWorker(promise: Promise<any>): Worker {
    return this.promiseToWorkerMap.get(promise);
  }

  private createPromiseForWorker<T>(worker: Worker, data: any) {
    return new Promise<T>((resolve, reject) => {
      worker.addEventListener('message', (event) => resolve(event.data));
      worker.addEventListener('error', reject);
      worker.postMessage(data);
    });
  }

  public getOrCreateWorkerUrl(fn: Function): string {
    if (!this.workerFunctionToUrlMap.has(fn)) {
      const url = this.createWorkerUrl(fn);
      this.workerFunctionToUrlMap.set(fn, url);
      return url;
    }
    return this.workerFunctionToUrlMap.get(fn);
  }

  public createWorkerUrl(resolve: Function, template?): string {
    const resolveString     = resolve.toString();
    const webWorkerTemplate = template ? template : this.createDefaultTemplate(resolveString);
    const blob              = new Blob([webWorkerTemplate], {type: 'text/javascript'});

    return URL.createObjectURL(blob);
  }

  private createDefaultTemplate(resolveString) {
    return `
            self.addEventListener('message', function(e) {
                postMessage((${resolveString})(e.data));
            });
        `;
  }

  private createPromiseCleaner<T>(promise: Promise<T>): (input: any) => T {
    return (event) => {
      this.removePromise(promise);
      return event;
    };
  }

  private removePromise<T>(promise: Promise<T>): Promise<T> {
    const worker = this.promiseToWorkerMap.get(promise);
    if (worker) {
      worker.terminate();
    }

    this.promiseToWorkerMap.delete(promise);
    return promise;
  }
}

const webWorker = new CreateWebWorker();

export function WebWorkerMethod() {

  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    const method     = descriptor.value;
    descriptor.value = function (): Observable<any> {
      const args = Array.from(arguments);
      return from(webWorker.run(method, ...args));
    };
  };
}

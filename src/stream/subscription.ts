// Fuck this shit
// tslint:disable-next-line:no-any
export default class StreamSubscription<T = any> extends Promise<T> {

  protected onCancel: OnCancelCallback;
  protected onResolve: PromiseResolver<T>;
  protected onReject: PromiseRejector;


  constructor(executor: PromiseExecutor<T>) {
    let onResolve;
    let onReject;
    let onCancel;

    super((resolve: PromiseResolver<T>, reject: PromiseRejector) => {
      onResolve = resolve;
      onReject = reject;

      const result = executor(resolve, reject) || noop;

      if (typeof result === 'function') {
        onCancel = result;
      }

      if (result instanceof StreamSubscription) {
        result.then(resolve, reject);
        onCancel = () => result.cancel();
      }
    });

    this.onResolve = onResolve;
    this.onReject = onReject;
    this.onCancel = onCancel;
  }


  cancel() {
    this.onResolve();
    this.onCancel();
  }


  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: PromiseListener<T, TResult1>,
    onrejected?: PromiseListener<any, TResult2>,
  ): StreamSubscription<TResult1 | TResult2> {
    return new StreamSubscription<TResult1 | TResult2>((resolve, reject) => {
      super.then(() => {
        onfulfilled(null);
        resolve();
      }, (reason) => {
        onrejected(reason);
        reject(reason);
      });

      return this.onCancel;
    });
  }
}


function noop() {
  // no operation
}


type PromiseExecutor<T> = (
  resolve: PromiseResolver<T>,
  reject: PromiseRejector,
) => StreamSubscription | OnCancelCallback | void;

type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;
type PromiseRejector = (value?: Error | PromiseLike<Error>) => void;

type PromiseListener<TInput, TOutput> = ((value: TInput) => TOutput | PromiseLike<TOutput>) | undefined | null;


type OnCancelCallback = () => void;

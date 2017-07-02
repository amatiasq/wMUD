import { duckType } from '../utils';
import StreamSubscription from './subscription';


export default class ReadableStream<T> {

  static fromEvent<T>(object: IEventEmitter<T>, event: string, takeOnly?: number) {
    const stream = new ReadableStream<T>(
      duckType<IEventEmitterOn<T>>(object, 'on') ?
        next => object.on(event, next) :
        next => object.addEventListener(event, next),
    );

    // Linter is fucking with me now
    // tslint:disable-next-line:strict-type-predicates
    return takeOnly == null ? stream : stream.take(takeOnly);
  }


  static merge<T>(...streams: Array<ReadableStream<T>>) {
    debugger;
    const completed = streams.map(() => false);

    return new ReadableStream<T>((push, error, complete) => {
      const subscriptions = streams.map((stream, index) => {
        return stream
          .subscribe(push)
          .then(onComplete, error);

        function onComplete() {
          completed[index] = true;

          if (completed.every(Boolean))
            complete();
        }
      });

      return () => {
        subscriptions.forEach(subscription => subscription.cancel());
      };
    });
  }


  constructor(private onSubscribe: ReadableStreamSource<T>) {}


  subscribe(iterator?: (value: T) => CancelSubscription | void) {
    return new StreamSubscription((resolve, reject) => {
      return this.onSubscribe(iterator || noop);
    });
  }


  forEach(iterator: ReadableIterator<T>) {
    const stream = this;
    let index = 0;

    return this.subscribe((value) => iterator(value, index++, stream));
  }


  map<TOut>(mapper: ReadableMapper<T, TOut>) {
    return new ReadableStream<TOut>(push => {
      return this.forEach((value, index, stream) => {
        push(mapper(value, index++, stream));
      });
    });
  }


  flatMap<TOut>(mapper: ReadableMapper<T, TOut | IIterable<TOut>>) {
    return new ReadableStream<TOut>(push => {
      return this.forEach((value, index, stream) => {
        const mapped = mapper(value, index++, stream);

        if (isIterable(mapped)) {
          mapped.forEach(push);
        } else {
          push(mapped);
        }
      });
    });
  }


  take(count: number) {
    return new ReadableStream<T>(push => {
      const subscription = this.forEach((value, index) => {
        if (index >= count)
          return subscription.cancel();

        return push(value);
      });

      return subscription;
    });
  }


  takeUntil(stopper: Promise<{}>) {
    return new ReadableStream<T>(push => {
      const subscription = this.subscribe(push);
      stopper.then(() => subscription.cancel());
    });
  }


  debounce(milliseconds: number) {
    let lastTime = Date.now();
    let buffer: T[] = [];

    return new ReadableStream<T[]>(push => {
      return this.subscribe(value => {
        const now = Date.now();
        buffer.push(value);

        if (now - lastTime < milliseconds) {
          return null;
        }

        push(buffer);
        buffer = [];
        lastTime = now;
      });
    });
  }
}


function isIterable<T>(object: T | IIterable<T>): object is IIterable<T> {
    return duckType<IIterable<T>>(object, 'forEach');
}


function noop() {
  // No operation
}


type IteratorBase<T, TIndex, TCollection, TOutput> = (value: T, index: TIndex, collection: TCollection) => TOutput;
type ReadableMapper<TInput, TOutput> = IteratorBase<TInput, number, ReadableStream<TInput>, TOutput>;
type ReadableIterator<T> = ReadableMapper<T, void>;

type CancelSubscription = StreamSubscription | (() => void);
type ReadableStreamOnNext<T> = (value: T) => void;
type ReadableStreamOnNextCancellable<T> = (value: T) => CancelSubscription;
type ReadableStreamOnError = (error: Error) => void;
type ReadableStreamOnComplete = () => void;

type ReadableStreamSource<T> = (
  push: ReadableStreamOnNext<T> | ReadableStreamOnNextCancellable<T>,
  error?: ReadableStreamOnError,
  complete?: ReadableStreamOnComplete,
) => CancelSubscription | void;


interface IIterable<T> {
  forEach(iterator: (value: T) => void): void;
}

type IEventEmitter<T> = IEventEmitterOn<T> | IEventEmitterAdd<T>;

interface IEventEmitterOn<T> {
  on(signal: string, listener: (event: T) => void): void;
}

interface IEventEmitterAdd<T> {
  addEventListener(signal: string, listener: (event: T) => void): void;
}


type EventListener<T> = (value: T) => void;

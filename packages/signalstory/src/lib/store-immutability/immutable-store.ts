import { Store } from '../store';
import { ImmutableStoreConfig } from './immutable-store-config';
import { Immutable } from './immutable-type';
import { naiveCloneAndMutateFunc } from './immutable-utility';

/**
 * Compares two values for strict equality.
 * @param a - The first value to compare.
 * @param b - The second value to compate.
 * @returns  Returns `true` if the values are strictly equal, `false` otherwise.
 */
const strictEqual = <T>(a: T, b: T) => a === b;

/**
 * Represents a store that holds an immutable state, allowing mutation through controlled operations.
 *
 * @typeparam TState The type of the immutable state held by the store.
 */
export class ImmutableStore<TState> extends Store<Immutable<TState>> {
  private readonly cloneAndMutateFunc: (
    currentState: TState,
    mutation: (draftState: TState) => void
  ) => TState;

  public constructor(config: ImmutableStoreConfig<TState>) {
    super({
      ...config,
      stateEqualityFn: config.stateEqualityFn ?? strictEqual,
    });

    this.cloneAndMutateFunc =
      config.mutationProducerFn ??
      config.cloneAndMutateFunc ??
      naiveCloneAndMutateFunc;
  }

  /**
   * Clones and mutates the store's state using the provided mutator function, with an optional command name.
   * @param mutator A function that mutates the current state.
   * @param commandName The name of the command associated with the state mutation.
   */
  public override mutate(
    mutator: (currentState: TState) => void,
    commandName?: string
  ): void;
  public override mutate(
    mutator: (currentState: Immutable<TState>) => void,
    commandName?: string
  ): void;
  public override mutate(
    mutator:
      | ((currentState: TState) => void)
      | ((currentState: Immutable<TState>) => void),
    commandName?: string
  ): void {
    this.update(
      state =>
        this.cloneAndMutateFunc(
          state as TState,
          mutator as (currentState: TState) => void
        ) as Immutable<TState>,
      commandName
    );
  }
}

/*

Slim:
  - State (Persisted and serializable)
    - App
    - UI
    - Projects
  - Runtime (Not persisted)
    - Device
    - Caps
    - Image loader
    - Context (name, actions [previously: painter])
  Events:
    - Get passed the full State
    - Get passed the Runtime
    - Get passed the refresher functions (to trigger updates when needed)
    - Refresher functions
*/

type EventConstructor<S, E, R> = new (app: SlimRunner<S, E, R>) => E;

export class SlimRunner<S, E, R> {
  public readonly state: S;
  public readonly events: E;
  public readonly runtime: R;
  /** Refresher is a function available to all events that can trigger a refresh anywhere.
   * Useful to trigger updates to the DOM.
   **/
  public readonly refresher: (action?: string) => void;
  constructor(
    state: S,
    events: EventConstructor<S, E, R>,
    runtime: R,
    refresher?: (action?: string) => void
  ) {
    this.state = state;
    this.events = new events(this);
    this.runtime = runtime;
    this.refresher =
      refresher ||
      // tslint:disable-next-line:no-console
      (() => console.warn("No refresh function is defined in Slim Runner"));
  }
}

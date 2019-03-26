// tslint:disable:max-classes-per-file
// tslint:disable:interface-name
// tslint:disable:member-access
import { SlimRunner } from 'slim-runner';

class Todo {
    public title: string;
    public status: "Finished" | "Ongoing";
  
    constructor(title: string) {
      this.title = title;
      this.status = "Finished";
    }
  }
  
  class Todos {
    public todos: Map<number, Todo>;
    public selected: number | undefined;
    constructor() {
      this.todos = new Map();
    }
    public add(title: string) {
      const d = new Date();
      this.todos.set(d.getTime(), new Todo(title));
    }
    public close(id: number) {
      const todo = this.todos.get(id);
      if (todo) {
        todo.status = "Finished";
      }
    }
    public select(id: number) {
      const todo = this.todos.has(id);
      if (todo) {
        this.selected = id;
      }
    }
    public update(newTitle: string) {
      if (this.selected) {
        const todo = this.todos.get(this.selected);
        if (todo) {
          todo.title = newTitle;
        }
      }
    }
  }
  
  interface AppState {
    todos: Todos;
    ui: string;
  }
  
  const appState: AppState = {
    todos: new Todos(),
    ui: ""
  };
  
  // 2. Simple runtime information:
  interface AppRuntime {
    width: number;
    height: number;
  }
  const appRuntime: AppRuntime = { width: 800, height: 600 };
  
  // 3. Events:
  class AppEvents {
    public updateText: (newText: string) => void;
    public newTodo: (title: string) => void;
    constructor(readonly app: SlimRunner<AppState, AppEvents, AppRuntime>) {
      this.updateText = (newText: string) => {
        this.app.state.todos.update(newText);
      };
      this.newTodo = (title: string) => {
        this.app.state.todos.add(title);
      };
    }
  }
const grid = new SlimRunner(appState, AppEvents, appRuntime);
grid.events.newTodo("Test Todo");
console.log('GRID', grid);

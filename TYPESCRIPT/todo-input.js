System.register(['angular2/core', '../services/todo-service', './todo-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, todo_service_1, todo_model_1;
    var TodoInput;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (todo_service_1_1) {
                todo_service_1 = todo_service_1_1;
            },
            function (todo_model_1_1) {
                todo_model_1 = todo_model_1_1;
            }],
        execute: function() {
            TodoInput = (function () {
                function TodoInput(todoService) {
                    this.todoService = todoService;
                    this.todoModel = new todo_model_1.TodoModel();
                }
                TodoInput.prototype.onSubmit = function () {
                    this.todoService.addTodo(this.todoModel);
                    console.log(this.todoService.todos);
                    this.todoModel = new todo_model_1.TodoModel();
                };
                TodoInput = __decorate([
                    core_1.Component({
                        selector: 'todo-input',
                        template: "<div><form (submit)=\"onSubmit()\">\n    <input type=\"text\" [(ngModel)]=\"todoModel.title\">\n    </form></div>"
                    }),
                    __param(0, core_1.Inject(todo_service_1.TodoService)), 
                    __metadata('design:paramtypes', [Object])
                ], TodoInput);
                return TodoInput;
            }());
            exports_1("TodoInput", TodoInput);
        }
    }
});
//# sourceMappingURL=todo-input.js.map
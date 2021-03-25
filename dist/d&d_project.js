"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//autobind decorator
function autobind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return newDescriptor;
}
//Project input class
class NewProject {
    constructor() {
        this.templateEl = document.getElementById("project-input");
        this.hostEl = document.getElementById("app");
        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = importedHTMLElement.firstElementChild;
        this.element.id = "user-input"; //id is taken from css file
        this.titleInputEl = this.element.querySelector("#title");
        this.descrInputEl = this.element.querySelector("#description");
        this.pplInputEl = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
    TotalUserInput() {
        const createdTitle = this.titleInputEl.value;
        const createdDescr = this.descrInputEl.value;
        const numberOfPpl = this.pplInputEl.value;
        if (createdTitle.trim().length === 0 ||
            createdDescr.trim().length === 0 ||
            numberOfPpl.trim().length === 0) {
            alert("Invalid input. Please try again");
            return;
        }
        else {
            return [createdTitle, createdDescr, +numberOfPpl];
        }
    }
    clearInputs() {
        this.titleInputEl.value = "";
        this.descrInputEl.value = "";
        this.pplInputEl.value = "";
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.TotalUserInput();
        if (Array.isArray(userInput)) {
            const [title, descr, people] = userInput;
            console.log(title, descr, people);
            this.clearInputs();
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    attach() {
        this.hostEl.insertAdjacentElement("afterbegin", this.element);
    }
    ;
}
__decorate([
    autobind
], NewProject.prototype, "submitHandler", null);
const ProjectInput = new NewProject();

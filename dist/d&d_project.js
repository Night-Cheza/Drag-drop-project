"use strict";
//Project state managment
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ProjectManager {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new ProjectManager();
            return this.instance;
        }
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addProject(title, description, numOfPeople) {
        const newProject = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: numOfPeople
        };
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()); //create a brend new copy of a project that then we manipulate with
        }
    }
}
const projectManager = ProjectManager.getInstance(); // creating global const we can use anywhere
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
function validate(validInput) {
    let isValid = true;
    if (validInput.required) {
        isValid = isValid && validInput.value.toString().trim().length !== 0;
    }
    if (validInput.minLength != null && typeof validInput.value === "string") {
        isValid = isValid && validInput.value.length >= validInput.minLength;
    }
    if (validInput.maxLength != null && typeof validInput.value === "string") {
        isValid = isValid && validInput.value.length <= validInput.maxLength;
    }
    if (validInput.minNum != null && typeof validInput.value === "number") {
        isValid = isValid && validInput.value >= validInput.minNum;
    }
    if (validInput.maxNum != null && typeof validInput.value === "number") {
        isValid = isValid && validInput.value <= validInput.maxNum;
    }
    return isValid;
}
//ProjectList Class
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateEl = document.getElementById("project-list");
        this.hostEl = document.getElementById("app");
        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = importedHTMLElement.firstElementChild;
        this.element.id = `${this.type}-projects`; //string interpolation
        this.attach();
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }
    attach() {
        this.hostEl.insertAdjacentElement("beforeend", this.element);
    }
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
        const titleValid = {
            value: createdTitle,
            required: true,
        };
        const descrValid = {
            value: createdDescr,
            required: true,
            minLength: 2,
        };
        const pplValid = {
            value: +numberOfPpl,
            required: true,
            minNum: 0,
            maxNum: 10,
        };
        if (!validate(titleValid) ||
            !validate(descrValid) ||
            !validate(pplValid)) {
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
            projectManager.addProject(title, descr, people);
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
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

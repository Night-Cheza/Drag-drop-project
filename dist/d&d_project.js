"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    // @ts-ignore
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//Project Sample
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Completed"] = 1] = "Completed";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectManager extends State {
    constructor() {
        super();
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
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active); //new created project by default is active
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find(proj => proj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) { //loop through all listeners functions
            listenerFn(this.projects.slice()); //create a brend new copy of a project that then we manipulate with
        }
    }
}
const projectManager = ProjectManager.getInstance(); // creating global const we can use anywhere
//Autobind decorator
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
//General Component Class
class Component {
    constructor(templateID, hostElementId, insertAtBeginning, newElementID) {
        this.templateEl = document.getElementById(templateID);
        this.hostEl = document.getElementById(hostElementId);
        // @ts-ignore
        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = importedHTMLElement.firstElementChild;
        if (newElementID) {
            this.element.id = newElementID;
        }
        this.attach(insertAtBeginning);
    }
    attach(insetrAtStart) {
        this.hostEl.insertAdjacentElement(insetrAtStart ? "afterbegin" : "beforeend", this.element);
    }
}
//ProjectItem Class
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get ppl() {
        if (this.project.people === 1) {
            return "1 person";
        }
        else {
            return this.project.people + " persons";
        }
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id); //to atach data to drag event
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(event) { }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.ppl + " assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    autobind
], ProjectItem.prototype, "dragEndHandler", null);
//ProjectList Class
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault(); //allows dropping into an area
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const projId = event.dataTransfer.getData("text/plain");
        projectManager.moveProject(projId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Completed);
    }
    dragLeaveHandler(event) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
        projectManager.addListener((projects) => {
            const actualProjects = projects.filter(proj => {
                if (this.type === "active") {
                    return proj.status === ProjectStatus.Active;
                }
                return proj.status === ProjectStatus.Completed;
            });
            this.assignedProjects = actualProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`);
        listEl.innerHTML = "";
        for (const projItem of this.assignedProjects) {
            // const listItem = document.createElement("li");
            // listItem.textContent = projItem.title;
            // listEl.appendChild(listItem);
            new ProjectItem(this.element.querySelector("ul").id, projItem);
        }
    }
}
__decorate([
    autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dragLeaveHandler", null);
//Project input class
class NewProject extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputEl = this.element.querySelector("#title");
        this.descrInputEl = this.element.querySelector("#description");
        this.pplInputEl = this.element.querySelector("#people");
        this.configure();
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent() {
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
            projectManager.addProject(title, descr, people); //creating a new project
            console.log(title, descr, people);
            this.clearInputs();
        }
    }
}
__decorate([
    autobind
], NewProject.prototype, "submitHandler", null);
const ProjectInput = new NewProject();
const activeProjectList = new ProjectList("active");
const completedProjectList = new ProjectList("completed");

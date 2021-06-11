//Project Sample
enum ProjectStatus {Active, Finished}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {}
}

//Project state managment
type Listener = (items: Project[]) => void; //don't need listener to return anything, but need to fire when items are passed

class ProjectManager {
    private listeners: Listener[] = []; //idea of function references
    private projects: Project[] = [];
    private static instance: ProjectManager;

    private constructor() {}

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new ProjectManager();
            return this.instance;
        }
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active); //new created project by default is active
           
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) { //loop through all listeners functions
            listenerFn(this.projects.slice()); //create a brend new copy of a project that then we manipulate with
        }
    }
}

const projectManager = ProjectManager.getInstance(); // creating global const we can use anywhere


//autobind decorator
function autobind (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor: PropertyDescriptor = {
        configurable: true,
        get () {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return newDescriptor;
}

//Project input validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minNum?: number;
    maxNum?: number;
}

function validate(validInput: Validatable) {
    let isValid = true;
    if(validInput.required) {
        isValid = isValid && validInput.value.toString().trim().length !== 0;
    }
    if(validInput.minLength != null && typeof validInput.value === "string") {
        isValid = isValid && validInput.value.length >= validInput.minLength;
    }
    if(validInput.maxLength != null && typeof validInput.value === "string") {
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
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        this.templateEl = <HTMLTemplateElement> document.getElementById("project-list")!;
        this.hostEl = <HTMLDivElement> document.getElementById("app")!;
        this.assignedProjects = [];

        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = <HTMLElement> importedHTMLElement.firstElementChild;
        this.element.id = `${this.type}-projects`; //string interpolation
        
        projectManager.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        
        this.attach();
        this.renderContent();
    }

    private renderProjects () {
        const listEl = <HTMLUListElement> document.getElementById(`${this.type}-project-list`)!;
        for (const projItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = projItem.title;
            listEl.appendChild(listItem)
        }
    }

    private renderContent () {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent =
         this.type.toUpperCase()+ ' PROJECTS';
        
    }

    private attach() {
        this.hostEl.insertAdjacentElement ("beforeend", this.element);
    }
}



//Project input class
class NewProject {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLFormElement;
    titleInputEl: HTMLInputElement;
    descrInputEl: HTMLInputElement;
    pplInputEl: HTMLInputElement;

    constructor() {
        this.templateEl = <HTMLTemplateElement> document.getElementById("project-input")!;
        this.hostEl = <HTMLDivElement> document.getElementById("app")!;

        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = <HTMLFormElement> importedHTMLElement.firstElementChild;
        this.element.id = "user-input"; //id is taken from css file

        this.titleInputEl = <HTMLInputElement> this.element.querySelector("#title");
        this.descrInputEl = <HTMLInputElement> this.element.querySelector("#description");
        this.pplInputEl = <HTMLInputElement> this.element.querySelector("#people");

        this.configure();
        this.attach();
    }  

    private TotalUserInput(): [string, string, number] | void {
        const createdTitle = this.titleInputEl.value;
        const createdDescr = this.descrInputEl.value;
        const numberOfPpl = this.pplInputEl.value;

        const titleValid: Validatable = {
            value: createdTitle,
            required: true,
        };
        const descrValid: Validatable = {
            value: createdDescr,
            required: true,
            minLength: 2,
        };
        const pplValid: Validatable = {
            value: +numberOfPpl,
            required: true,
            minNum: 0,
            maxNum: 10,
        };

        if (
            !validate(titleValid) ||
            !validate(descrValid) ||
            !validate(pplValid)
        ) {
            alert ("Invalid input. Please try again");
            return;
        } else {
            return [createdTitle, createdDescr, +numberOfPpl];
        }
    }

    private clearInputs () {
        this.titleInputEl.value = "";
        this.descrInputEl.value = "";
        this.pplInputEl.value = "";
    }

    @autobind
    private submitHandler (event: Event) {
        event.preventDefault();
        const userInput = this.TotalUserInput();
        if (Array.isArray(userInput)) {
            const [title, descr, people] = userInput;
            projectManager.addProject(title, descr, people); //creating a new project
            console.log(title, descr, people);
            this.clearInputs();
        }
    }
    
    private configure () {
        this.element.addEventListener ("submit", this.submitHandler);
    }

    private attach () {
      this.hostEl.insertAdjacentElement ("afterbegin", this.element);
    };
}

const ProjectInput = new NewProject ();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

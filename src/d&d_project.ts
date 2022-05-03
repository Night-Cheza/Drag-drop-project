//Drag and Drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget { //for boxes/containers where from and to where to drag an element
    dragOverHandler(event: DragEvent): void; //permits the drop into area we want to drop
    dropHandler(event: DragEvent): void; //handles the drop
    dragLeaveHandler(event: DragEvent): void; //to revert update if something goes wrong
}

//Project Sample
enum ProjectStatus {
    Active, Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

//Project state managment
type Listener<T> = (items: T[]) => void; //don't need listener to return anything, but need to fire when items are passed

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectManager extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectManager;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new ProjectManager();
            return this.instance;
        }
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


//Autobind decorator
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

//General Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateEl: HTMLTemplateElement;
    hostEl: T;
    element: U;

    constructor(
        templateID: string,
        hostElementId: string,
        insertAtBeginning: boolean,
        newElementID?: string
    ) {
        this.templateEl = <HTMLTemplateElement> document.getElementById(templateID)!;
        this.hostEl = document.getElementById(hostElementId)! as T;

        const importedHTMLElement = document.importNode(this.templateEl.content, true);
        this.element = importedHTMLElement.firstElementChild as U;

        if (newElementID) {
            this.element.id = newElementID;
        }

        this.attach(insertAtBeginning);
    }

    private attach(insetrAtStart: boolean) {
        this.hostEl.insertAdjacentElement (insetrAtStart ? "afterbegin" : "beforeend", this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//ProjectItem Class
class ProjectItem extends Component <HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get ppl() {
        if (this.project.people === 1) {
            return "1 person";
        } else {
            return this.project.people + " persons";
        }
    }

    constructor(hostId: string, project: Project){
        super("single-project", hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent) { 
     
    }

    @autobind
    dragEndHandler(event: DragEvent) {}

    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.ppl + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

//ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.add("droppable");
    }
    
    dropHandler(event: DragEvent) {}

    @autobind
    dragLeaveHandler(event: DragEvent) {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }

    configure () {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectManager.addListener((projects: Project[]) => {
            const actualProjects = projects.filter(proj => {
                if(this.type === "active") {
                    return proj.status === ProjectStatus.Active;
                }
                return proj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = actualProjects;
            this.renderProjects();
        });
    }

    renderContent () {
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent =
         this.type.toUpperCase()+ ' PROJECTS';        
    }

    private renderProjects () {
        const listEl = <HTMLUListElement> document.getElementById(`${this.type}-project-list`)!;
        listEl.innerHTML = "";
        for (const projItem of this.assignedProjects) {
            // const listItem = document.createElement("li");
            // listItem.textContent = projItem.title;
            // listEl.appendChild(listItem);
            new ProjectItem(this.element.querySelector("ul")!.id, projItem);
        }
    }
}



//Project input class
class NewProject extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputEl: HTMLInputElement;
    descrInputEl: HTMLInputElement;
    pplInputEl: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInputEl = <HTMLInputElement> this.element.querySelector("#title");
        this.descrInputEl = <HTMLInputElement> this.element.querySelector("#description");
        this.pplInputEl = <HTMLInputElement> this.element.querySelector("#people");

        this.configure();
    }  

    configure () {
        this.element.addEventListener ("submit", this.submitHandler);
    }

    renderContent() {
        
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
}

const ProjectInput = new NewProject ();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

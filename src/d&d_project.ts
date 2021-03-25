
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

//Input validation
interface Validatable {
    value: string | number;
    required: boolean;
    minLength: number;
    maxLength: number;
    minNum: number;
    maxNum: number;
}

//Project input class
class NewProject {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLFormElement;
    titleInputEl: HTMLInputElement;
    descrInputEl: HTMLInputElement;
    pplInputEl: HTMLInputElement;

    constructor () {
      this.templateEl = document.getElementById("project-input")! as HTMLTemplateElement;
      this.hostEl = document.getElementById("app")! as HTMLDivElement;

      const importedHTMLElement = document.importNode(this.templateEl.content, true);
      this.element = importedHTMLElement.firstElementChild as HTMLFormElement;
      this.element.id = "user-input"; //id is taken from css file

      this.titleInputEl = this.element.querySelector("#title") as HTMLInputElement;
      this.descrInputEl = this.element.querySelector("#description") as HTMLInputElement;
      this.pplInputEl = this.element.querySelector("#people") as HTMLInputElement;

      this.configure();
      this.attach();
    }  

    private TotalUserInput (): [string, string, number] | void{
        const createdTitle = this.titleInputEl.value;
        const createdDescr = this.descrInputEl.value;
        const numberOfPpl = this.pplInputEl.value;

        if (
            createdTitle.trim().length === 0 ||
            createdDescr.trim().length === 0 ||
            numberOfPpl.trim().length === 0
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
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.TotalUserInput();
        if (Array.isArray(userInput)) {
            const [title, descr, people] = userInput;
            console.log(title, descr, people);
            this.clearInputs();
        }
    }
    
    private configure () {
        this.element.addEventListener("submit", this.submitHandler);
    }

    private attach (){
      this.hostEl.insertAdjacentElement ("afterbegin", this.element);
    };
}

const ProjectInput = new NewProject ();
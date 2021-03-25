
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
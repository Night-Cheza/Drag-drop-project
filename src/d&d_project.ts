
interface ProjectTemplate {
    title: string;    
    description?: string;
    people?: number;
}

interface ValidatorConfig {
    [property: string]: {
        [validProp: string]: string []
    };
}

const registeredValidator: ValidatorConfig = {};


function Required (target:any, propName: string) {
    registeredValidator[target.constructor.name] = {
        ...registeredValidator[target.constructor.name],
        [propName]: [...registeredValidator[target.constructor.name] [propName], "required"]
    };
}

function PositiveNumber (target: any, propName: string) {
    registeredValidator[target.constructor.name] = {
        ...registeredValidator[target.constructor.name],
        [propName]: [...registeredValidator[target.constructor.name] [propName], "positive"]
    };
}

function validate (obj:any) {
    const objValidatorConfig = registeredValidator [obj.constructor.name];
    if(!objValidatorConfig) {
        return true
    }
    let isValid = true;
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig[prop]) {
            switch (validator) {
                case "required":
                    isValid = isValid && !!obj[prop];
                    break;
                case "positive":
                    isValid = isValid && + obj[prop] > 0;
            }
        }
    }
    return isValid;
}


class NewProject implements ProjectTemplate {

    @Required
    title: string;    
    @Required
    description: string;
    @PositiveNumber
    people: number

    constructor (ttl: string, descr: string, ppl: number) {
        this.title = ttl;
        this.description = descr;
        this.people = ppl;
    }
}

const projectInput = document.getElementById("project-input") as HTMLFormElement;
projectInput.addEventListener("ADD PROJECT", event => {

    const titleEl = <HTMLInputElement> document.getElementById ("title");
    const descriptionEl = document.getElementById("description") as HTMLInputElement;
    const peopleEl = document.getElementById("people") as HTMLInputElement;

    const title = titleEl.value;
    const description = descriptionEl.value;
    const people = +peopleEl.value;
    if (people < 10) {
        return +people
    } else {
        alert ("Invalidinput. Please try again")
    }
    

    const createdProject = new NewProject (title, description, people);

    if(!validate (createdProject)) {
        alert ("Invalid input. Please try again");
    }

    console.log(createdProject);

});

/*class SingleProject implements ProjectTemplate {
    title: string;

    constructor (ttl: string) {
        this.title = ttl;
    }
}

class ProjectList implements ProjectTemplate {
    title: string;

    constructor (ttl: string) {
        this.title = ttl;
    }
} */







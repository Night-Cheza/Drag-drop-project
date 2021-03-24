"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const registeredValidator = {};
function Required(target, propName) {
    registeredValidator[target.constructor.name] = Object.assign(Object.assign({}, registeredValidator[target.constructor.name]), { [propName]: [...registeredValidator[target.constructor.name][propName], "required"] });
}
function PositiveNumber(target, propName) {
    registeredValidator[target.constructor.name] = Object.assign(Object.assign({}, registeredValidator[target.constructor.name]), { [propName]: [...registeredValidator[target.constructor.name][propName], "positive"] });
}
function validate(obj) {
    const objValidatorConfig = registeredValidator[obj.constructor.name];
    if (!objValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig[prop]) {
            switch (validator) {
                case "required":
                    isValid = isValid && !!obj[prop];
                    break;
                case "positive":
                    isValid = isValid && +obj[prop] > 0;
            }
        }
    }
    return isValid;
}
class NewProject {
    constructor(ttl, descr, ppl) {
        this.title = ttl;
        this.description = descr;
        this.people = ppl;
    }
}
__decorate([
    Required
], NewProject.prototype, "title", void 0);
__decorate([
    Required
], NewProject.prototype, "description", void 0);
__decorate([
    PositiveNumber
], NewProject.prototype, "people", void 0);
const projectInput = document.getElementById("project-input");
projectInput.addEventListener("ADD PROJECT", event => {
    const titleEl = document.getElementById("title");
    const descriptionEl = document.getElementById("description");
    const peopleEl = document.getElementById("people");
    const title = titleEl.value;
    const description = descriptionEl.value;
    const people = +peopleEl.value;
    if (people < 10) {
        return +people;
    }
    else {
        alert("Invalidinput. Please try again");
    }
    const createdProject = new NewProject(title, description, people);
    if (!validate(createdProject)) {
        alert("Invalid input. Please try again");
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

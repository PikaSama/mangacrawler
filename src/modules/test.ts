class sayMyName {
    name: string;
    constructor(name) {
        this.name = name;
    }
    sayName(): void {
        console.log("Hi!",this.name);
    }
}
const a = new sayMyName("Zorin");
a.sayName();
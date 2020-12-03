class sayMyName {
    constructor(name) {
        this.name = name;
    }
    sayName() {
        console.log("Hi!", this.name);
    }
}
const a = new sayMyName("Zorin");

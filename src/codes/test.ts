function f({ a, b = 1 }: { a:string, b?:number }): void {
    console.log(a);
    console.log(b);
}
f({a:'Hey'});
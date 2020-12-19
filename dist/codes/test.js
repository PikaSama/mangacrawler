function f({ a, b = 1 }) {
    console.log(a);
    console.log(b);
}
f({ a: 'Hey' });

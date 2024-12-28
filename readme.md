# SSR Promise

## Step1. Use renderToPipeableStream on SSR

```js
// before
app.get('/', (req, res) => {
    res.write(renderToString(
        <div id="app">
            <App />
        </div>
    ));
});

// after
app.get('/', (req, res) => {
    const stream = renderToPipeableStream((
        <div id="app">
            <App />
        </div>
    ), {
        onAllReady () {
            stream.pipe(res);  
            res.write('<script src="/client.js"></script>');      
        },
    });
});
    
```

## Step 2. Add SSR Cache

```js
app.get('/', (req, res) => {
    const cache = new Cache();

    const stream = renderToPipeableStream((
        <div id="app">
            <ServerPromiseProvider server cache={cache}>
                <App />
            </ServerPromiseProvider>
        </div>
    ), {
        onAllReady () {
            // ...
            stream.pipe(res);

            res.write(`<script nonce id="storage" type="application/json">${cache.stringify()}</script>`);
            // ...
        }
    })
```

## Step 3. Unwrap cache on client side

```jsx
const app = document.getElementById('app');
const cache = Cache.parse(document.getElementById('storage')).innerText;

const root = hydrateRoot(app, (
    <ServerPromiseProvider client cache={cache}>
        <App />
    </ServerPromiseProvider>
));
```

## Step 4. Enjoy!

```js
// Data will be rendered on SSR
const data = useServerPromise(() => fetch('...'));

return (
    <div>
        Value: {data}
    </div>
);
```

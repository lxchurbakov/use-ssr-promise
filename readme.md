# SSR Promise

Just use promises on your SSR. (React 18+)

## Step 1. Switch to renderToPipeableStream on Server Side

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

## Step 2. Add ServerPromiseProvider with Cache on Server Side

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

## Step 3. Add ServerPromiseProvider and unwrap Cache on Client Side

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
// Data will be rendered on SSR and rehydrated on client side
const data = useServerPromise(() => fetch('...'));

return (
    <div>
        Value: {data}
    </div>
);
```

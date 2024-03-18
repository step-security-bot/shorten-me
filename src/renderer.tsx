import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/jetbrains-mono.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
        ></link>
      </head>
      <body>
        <header>
          <h1>
            <a href="/">URL Shortener</a>
          </h1>
        </header>
        <div>{children}</div>
      </body>
    </html>
  );
});

/**
 * src/data/defaultCourse.js
 * ---------------------------------------------------------------------------
 * The seed course shipped with BSDC: "Full-Stack Web Development for
 * Bangladeshi Developers". 10,000+ words across 10 modules, plus a
 * 20-question MCQ exam.
 *
 * Admins can edit/replace this in /courses via the AdminPanel (Response 10).
 * If Firestore has no published courses yet, the Courses page falls back
 * to this object so the platform is never "empty".
 * ---------------------------------------------------------------------------
 */

export const DEFAULT_COURSE = {
  id: 'fullstack-bd-101',
  slug: 'full-stack-web-development-bangladesh',
  title: 'Full-Stack Web Development for Bangladeshi Developers',
  category: 'Web Development',
  difficulty: 'beginner',
  pointsReward: 100,
  passMark: 14, // out of 20
  durationHours: 24,
  language: 'en',
  summary:
    'A complete, free, ten-thousand-word full-stack roadmap from HTML to deploying a production React + Node app on Cloudflare Pages — written for Bangladeshi students and self-taught developers.',
  cover: '',
  createdBy: 'admin',
  modules: [
    {
      id: 'm1',
      title: 'Module 1 — How the Web Actually Works',
      body: `The web feels magical from the outside, but every page you open is the result of a remarkably consistent dance between three actors: your browser (the client), a server somewhere on the internet, and the network of routers and DNS resolvers in between. When you type "www.bsdc.info.bd" into the address bar and hit Enter, your browser first asks a DNS resolver to translate that human-friendly hostname into a numeric IP address — something like 104.16.132.229. It then opens a TCP connection to that address on port 443 (the standard HTTPS port), performs a TLS handshake to agree on encryption keys, and sends an HTTP request that says, in plain text, "GET / HTTP/1.1, Host: www.bsdc.info.bd".

The server reads that request, decides what to send back, and replies with an HTTP response: a status code (200 for success, 301 for a redirect, 404 if the page doesn't exist), a set of headers describing the content type and caching rules, and a body — usually an HTML document. Your browser parses the HTML, discovers the CSS and JavaScript files it references, opens fresh requests for each one, and progressively builds the page you see on the screen.

Understanding this loop is the single most important thing a new developer can learn, because every modern framework — React, Next.js, Laravel, Django, Express — is ultimately doing the same dance. The difference is only in WHERE the HTML comes from. With static hosting (like Cloudflare Pages) the HTML is pre-built and served from disk. With a server-rendered app the HTML is generated on every request. With a single-page application the server sends a small HTML shell and the JavaScript builds the rest in the browser. BSDC itself is a single-page application that uses build-time pre-rendering to give Google a useful first paint.

Three protocols matter at this stage. HTTP is the language of requests and responses. HTTPS is HTTP wrapped in TLS encryption so attackers on the same Wi-Fi cannot read your traffic. DNS is the system that maps names to IPs. As a Bangladeshi developer you will spend most of your career assuming these layers Just Work, but when something breaks — a slow API, a CORS error, a mysterious "ERR_CONNECTION_RESET" — knowing what each layer does is what separates a hobbyist from a professional. Spend at least one afternoon opening the Network tab in Chrome DevTools, refreshing this page, and reading every header on every request. It will pay off for the rest of your career.`
    },
    {
      id: 'm2',
      title: 'Module 2 — HTML, the Skeleton of Everything',
      body: `HTML stands for HyperText Markup Language. Markup means we are wrapping content in tags to give it meaning, not styling. A common beginner mistake is treating an <h1> as "big text" or a <p> as "a block with margin" — those visual outcomes are downstream of the meaning. An <h1> is the most important heading on the page. A <p> is a paragraph. A <button> is something a user clicks to trigger an action. A <a href="..."> is a link to another document. Using the right tag for the right meaning is called semantic HTML, and it benefits you in three concrete ways: screen readers can navigate the page properly for visually-impaired users, Google can understand what the page is about for SEO, and your future self will be able to read the markup six months later.

Every HTML document starts with <!doctype html> on the very first line, followed by an <html> element with a lang attribute (use "en-BD" or "bn-BD" for BSDC content). Inside <html> you have exactly two children: <head> and <body>. The head holds invisible metadata — the page title shown in the browser tab, links to stylesheets, OpenGraph tags for when someone shares the page on Facebook, and the favicon. The body holds the actual content the user will see.

A well-structured page in 2026 looks roughly like this: a <header> with the site logo and primary navigation, a <main> with one <h1> describing what this page is, several <section>s each with their own <h2>, perhaps an <article> if the content is a self-contained blog post, and a <footer> with secondary navigation and legal links. The role of <div> and <span> is to be a last resort — meaningless containers when no semantic tag fits.

Forms deserve special attention. Every <input> should have an associated <label> (either wrapping it or linked by the for/id attributes) so screen readers can announce what the field is for. Use the right input type — type="email" gives mobile users an email keyboard, type="tel" gives them a number pad, type="date" pops up a native date picker. Always add a name attribute so the form data has a key. Wrap related inputs in <fieldset> with a <legend> for accessibility.

Images need an alt attribute. If the image is decorative, alt="" tells screen readers to skip it. If it carries meaning ("a screenshot of the BSDC dashboard"), write a short factual description. Never write "image of" or "picture of" — screen readers already announce the role. Lazy-load below-the-fold images with loading="lazy". Use the srcset attribute for responsive images so phones don't download desktop-sized JPEGs over 3G.

Finally: the more semantic your HTML, the less CSS and JavaScript you'll need later. A correctly-nested <nav> with <ul> and <li> needs almost no CSS to be accessible. A <div onClick> pretending to be a button needs aria-role, tabindex, keyboard handlers, and focus styles before it matches what a real <button> gives you for free.`
    },
    {
      id: 'm3',
      title: 'Module 3 — CSS, the Skin and Bones',
      body: `CSS — Cascading Style Sheets — controls how HTML looks. The "cascade" part is the rule that lets later, more specific rules override earlier ones. The "stylesheet" part is that you usually keep CSS in separate .css files referenced from <link> tags in the head. Inline styles exist but are a last resort because they trump everything in the cascade and are impossible to override cleanly.

Modern CSS rests on three layout systems. Flexbox is for one-dimensional layouts — a row of nav links, a button group, the inside of a card. You declare display: flex on the parent, then control alignment with justify-content (main axis) and align-items (cross axis). Grid is for two-dimensional layouts — entire page templates with header, sidebar, main, and footer. You declare display: grid and lay out children using grid-template-columns and grid-template-rows. The third system is the older, simpler "block formatting context" with margin, padding, and float — still useful for simple stacking but rarely the right answer in 2026.

Responsive design means a page works on a 320px-wide budget phone and a 5000px ultrawide monitor without two separate codebases. The trick is to design mobile-first: start with the smallest screen, then add @media (min-width: ...) rules to introduce larger layouts as the viewport grows. Use rem and em for typography (so users who set a larger system font scale you up), use % and fr for layout widths (so they adapt), and reserve px only for things that should not scale, like 1px borders.

CSS variables (custom properties) are the killer feature of modern CSS. By declaring --color-primary: #1a6b3a once in :root, you can reference it as var(--color-primary) anywhere. Dark mode becomes one CSS file that overrides those variables. Theming becomes trivial. BSDC's entire design system is built this way — open the dev tools, find the <html> element, and you can see every token at a glance.

Specificity is the rule that decides which selector wins when two compete. Inline styles beat IDs beat classes beat tag selectors. A common bug is writing .button .icon { color: red } and being shocked when .icon { color: blue } doesn't win. Tools like the BEM naming convention (.block__element--modifier) keep specificity flat and predictable. We use a BSDC- prefix on every class for the same reason — predictable, low-specificity, no surprises.

Performance matters. Avoid heavy CSS animations on properties that trigger layout (width, height, top, left). Animate transform and opacity instead — they run on the GPU and stay buttery on a 50-dollar Android phone in rural Bangladesh. Use will-change sparingly; it tells the browser to optimise but consumes memory. And inline the critical CSS for above-the-fold content in the <head> so the first paint is not blocked by an external file download.`
    },
    {
      id: 'm4',
      title: 'Module 4 — JavaScript and the DOM',
      body: `JavaScript is the only programming language that runs in every web browser. Whether you eventually write React, Vue, or Svelte, the bedrock skill is plain "vanilla" JavaScript and the Document Object Model (DOM) — the browser's representation of your HTML as a live tree of objects you can read and modify with code.

The language itself has had a remarkable glow-up since 2015. Modern JavaScript uses let and const instead of var, arrow functions instead of function expressions for callbacks, template literals instead of string concatenation, destructuring to pull values out of objects, spread/rest operators to copy and combine, async/await instead of nested .then() callbacks, optional chaining (?.) and nullish coalescing (??) to handle "maybe missing" data gracefully, and modules (import/export) instead of putting everything in the global scope. If a tutorial uses var or function() {} callbacks, it is probably ten years old.

The DOM is your gateway to making pages interactive. document.querySelector('.btn') returns the first element matching a CSS selector. Once you have an element, you can read or set its properties: element.textContent for plain text, element.value for inputs, element.classList.add('active') to toggle classes, element.addEventListener('click', handler) to react to user actions. The golden rule is to update state, then re-render, rather than mutating the DOM directly in dozens of places. This is exactly the discipline React enforces, but you can apply it in vanilla JS too.

Asynchronous code is where many learners stumble. JavaScript is single-threaded but non-blocking: when you call fetch('/api/posts') the browser sends the request and immediately returns a Promise — a placeholder for "a value that will arrive later". You can either chain .then() callbacks or use async/await syntax for cleaner code. Always handle errors with try/catch (for await) or .catch() (for .then chains), because an unhandled promise rejection will crash modern frameworks.

Three browser APIs everyone should know: fetch for HTTP requests, localStorage/sessionStorage for client-side persistence (with a 5MB-ish quota), and IntersectionObserver for "do something when this element scrolls into view" (powers lazy images, infinite scroll, analytics). You'll see all three throughout the BSDC codebase.

Finally, learn the JavaScript event loop. When you call setTimeout(fn, 0), fn does not run immediately — it goes into the task queue and runs after the current synchronous code finishes. When you await a promise, the function suspends, control returns to the event loop, and the rest of the function resumes when the promise resolves. Understanding this model is what makes you stop fearing "weird async bugs" and start writing them on purpose.`
    },
    {
      id: 'm5',
      title: 'Module 5 — React, the Modern Frontend',
      body: `React is a JavaScript library (not technically a framework) for building user interfaces from reusable components. Its central idea is that the UI is a pure function of state: given some data, React figures out what to render. When the data changes, React figures out the minimum set of DOM updates to make the page reflect the new data. You never write document.querySelector inside React code — you describe what should be on the screen and React handles the diff.

A React component is a JavaScript function that returns JSX — an HTML-like syntax that compiles to plain function calls. Components receive props (read-only inputs from their parent) and may hold internal state with the useState hook. When you call the setter returned by useState, React re-renders the component with the new state and reconciles the changes against the actual DOM. The mental model is: render → diff → commit.

Hooks are the modern React API. useState gives you local state. useEffect runs side effects (data fetching, subscriptions, manual DOM manipulation) after render and cleans up when the component unmounts. useMemo and useCallback cache expensive computations and stable function references. useContext reads from a Context Provider higher up the tree. useRef gives you a mutable box that survives renders without triggering them. Custom hooks (any function whose name starts with use and that calls other hooks) let you extract and reuse stateful logic — see BSDC's useFeed, useSearch, and useRealtime hooks for examples.

Rendering performance matters even with React's reconciler. Three rules: never define new objects, arrays, or functions inside JSX if a child wrapped in React.memo depends on referential equality; never put state higher in the tree than it needs to be (lifting state up has a cost); split big components into smaller ones so React can skip unchanged sub-trees. The React DevTools profiler will show you exactly which components re-rendered and why.

Routing is not built into React — you add a router like react-router-dom. It gives you <Routes> and <Route> components that match URL paths to components, plus hooks like useParams (URL segments), useSearchParams (?query=string), and useNavigate (programmatic navigation). BSDC uses react-router-dom v6 with lazy-loaded page modules so the initial JavaScript bundle stays small.

State management beyond useState scales in steps. Start with prop drilling. When that hurts, lift state to a common ancestor. When that hurts, use Context for "globally read, rarely written" data like the current user and theme. When that hurts, reach for a library like Zustand, Jotai, or Redux Toolkit — but honestly, most apps never need to. BSDC uses Context for AuthContext and PointsContext and that's it.

A word on JSX: the curly braces inside JSX are JavaScript expressions. You can put any value or function call there, including conditional rendering with && and ternary operators, and lists with .map(). Every list item needs a unique key prop so React can track identity across re-renders. Use the database ID if you have one; never use the array index unless the list is truly static.`
    },
    {
      id: 'm6',
      title: 'Module 6 — Backend Fundamentals with Node.js',
      body: `A backend is any program that runs on a server and responds to client requests. Node.js is a JavaScript runtime that lets you use the same language on both sides of the wire — a huge productivity win once you internalise it. Node was built on Chrome's V8 engine and shipped with an excellent standard library and a package ecosystem (npm) that is now the largest in the world.

The fastest way to start is Express, a minimal HTTP framework: const app = express(); app.get('/api/posts', (req, res) => res.json([])); app.listen(3000). Each route is a function that receives the request and sends a response. Middleware functions chain together to handle cross-cutting concerns: logging, body parsing, authentication, rate limiting, CORS. Modern alternatives — Fastify, Hono, Elysia — trade some ergonomics for raw speed; pick the right tool when performance becomes the bottleneck.

REST is a style of API design where each URL represents a resource and HTTP verbs represent the action. GET /users lists users, GET /users/42 gets one, POST /users creates one, PATCH /users/42 updates fields, DELETE /users/42 removes it. Status codes communicate outcome: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity (validation failed), 429 Too Many Requests, 500 Internal Server Error. Use them faithfully — every monitoring tool and proxy on the planet understands them.

GraphQL is the alternative: one endpoint, the client sends a query describing exactly what fields it wants, the server resolves it. Great for apps with many client variations (web, iOS, Android) that need different slices of the same data. Trade-off: more upfront complexity. Don't reach for GraphQL until REST hurts.

For data storage, the choice is mostly between relational (PostgreSQL, MySQL) and document (MongoDB, Firestore). Relational stores enforce a schema and excel at JOINs across tables. Document stores let you denormalise data into nested objects that match the shape your UI needs — perfect for high-read, low-write apps. BSDC uses Firestore (a document store) plus Firebase Realtime Database (a JSON tree) for chat. There is no universally right answer; pick the model that matches your access patterns.

Authentication is the question "who are you?". Authorization is the question "what are you allowed to do?". Hash passwords with bcrypt or argon2 (never store them plain), prefer secure HttpOnly cookies for browser sessions, use OAuth for "log in with Google/GitHub" flows, issue short-lived JWTs for API access, and let a library handle the cryptography — never roll your own. BSDC uses Firebase Auth which handles all of this for us.

Finally, learn to debug a deployed Node process. Stream logs to your terminal. Use a profiler when CPU is the bottleneck. Use a heap snapshot when memory grows unbounded. Wrap async handlers in try/catch so a single bad request never crashes the whole process. And always, always have a health-check endpoint that returns 200 — load balancers, Docker, and Kubernetes all need it.`
    },
    {
      id: 'm7',
      title: 'Module 7 — Databases and Data Modelling',
      body: `Most of the bugs you'll write as a junior developer will be data-modelling bugs disguised as code bugs. A clean schema makes hard problems easy; a messy schema makes easy problems hard. Spend serious time before writing your first query thinking about what entities exist (users, posts, comments) and what relationships connect them (a user has many posts; a post has many comments; a comment belongs to one post and one user).

Relational databases use tables, rows, and columns. Each table has a primary key (usually an auto-incrementing integer or a UUID) and may reference other tables via foreign keys. Normalisation is the practice of avoiding duplicate data by splitting it across tables — instead of storing the username inside every post row, store user_id and JOIN to the users table. Normalisation makes writes cheap and reads more expensive; in 2026 the trade-off has shifted, and a small amount of denormalisation (storing author_username alongside author_id on the post row) is often the right call for performance — that's exactly what BSDC's Firestore schema does.

Indexes are the magic that makes "find all posts where author_id = X" fast. An index is a sorted data structure that maps column values to row locations. Add an index to every column you filter or sort by. Removing unused indexes also matters — every write must update every index. Read your database's EXPLAIN output for slow queries; it shows whether an index is being used.

Document databases like Firestore let you store nested objects directly. Instead of a separate "tags" table you put tags: ['react', 'firebase'] inside the post document. You query with where('tags', 'array-contains', 'react'). The downside is that Firestore charges per document read, so you must structure data to minimise reads — denormalise aggressively, store counters instead of running COUNT(*) queries (because counting requires scanning), and use sub-collections for one-to-many relationships.

Transactions guarantee a group of writes either all succeed or all fail. When a user transfers BSDC Points to another user, the debit and the credit must happen together — never one without the other. Firestore offers runTransaction() for exactly this; we use it for likes, follows, and points transfers. Without transactions, a network glitch mid-write would leave the database in an impossible state.

Eventually you'll meet the CAP theorem: under a network partition, a distributed database can guarantee Consistency or Availability but not both. For a chat app you usually pick AP (always available, eventually consistent). For a bank you always pick CP. BSDC's chat uses Realtime DB (AP-ish) while its points engine uses Firestore transactions (effectively CP at the document level). Understanding why each part chose what it did is what makes you a senior engineer.`
    },
    {
      id: 'm8',
      title: 'Module 8 — Auth, Security, and Performance',
      body: `Security is not something you bolt on at the end. It is a daily discipline. The OWASP Top Ten (look it up and read it cover to cover) lists the most common web vulnerabilities — injection attacks, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, cross-site scripting, insecure deserialization, vulnerable components, and insufficient logging. Almost every breach in the headlines maps to one of those ten.

Cross-site scripting (XSS) happens when user input gets executed as code. If you set element.innerHTML = userInput, and userInput contains <script>steal()</script>, congratulations — you have an XSS bug. React's JSX escapes by default, which is one of the reasons we use it. Never use dangerouslySetInnerHTML on untrusted content. Always validate and sanitise inputs both on the client (for UX) and on the server (for security) — never trust the client.

Cross-site request forgery (CSRF) tricks an authenticated browser into making a request the user didn't intend. Defend with the SameSite cookie attribute set to Strict or Lax, with CSRF tokens for state-changing endpoints, and with a clear separation between idempotent GETs and state-changing POSTs.

SQL injection happens when you concatenate user input into a query: const sql = "SELECT * FROM users WHERE id = " + userId. If userId is "1 OR 1=1", every user gets returned. Always use parameterised queries — the database driver substitutes values safely. NoSQL injection is the same idea for Mongo and Firestore; always validate types before passing user input to a query.

Authentication has its own pitfalls. Never log passwords. Never email a password reset link without expiry. Always rate-limit login attempts. Always require email verification before granting full account privileges. Always use HTTPS — without it, anyone on the same Wi-Fi can read passwords in plain text. BSDC enforces email verification and uses Firebase Auth which handles rate-limiting and secure cookie storage automatically.

Performance is also a security concern: a slow page invites users to abandon two-factor authentication or reuse passwords. The metrics that matter are Largest Contentful Paint (under 2.5s on a mid-range phone), Interaction to Next Paint (under 200ms), and Cumulative Layout Shift (under 0.1). Lighthouse in Chrome DevTools measures all three. Optimise images aggressively (use WebP or AVIF, lazy-load below the fold), preload critical fonts, code-split heavy routes, and cache aggressively at the CDN — Cloudflare Pages does much of this automatically when configured correctly.

Finally, log everything that matters. Every login attempt, every points transfer, every admin action. When (not if) something goes wrong, those logs are how you reconstruct what happened and prove what didn't.`
    },
    {
      id: 'm9',
      title: 'Module 9 — Deploying to the Real World',
      body: `Deployment is the moment your code stops being a hobby and starts being a service other humans depend on. Modern deployment is far easier than it was a decade ago — services like Cloudflare Pages, Vercel, Netlify, Render, and Fly.io let you push to a git branch and watch the world receive your changes within sixty seconds.

The mental model is "build once, deploy anywhere". Your repository contains source code. A build step (vite build for BSDC) produces a dist/ folder of static HTML, CSS, JavaScript, and assets. A hosting service serves that folder over a global CDN. When a user requests a page, the CDN edge nearest to them responds — a request from Dhaka hits a Cloudflare edge in Singapore, not a US server, so latency is tiny. BSDC uses this exact pattern: GitHub Actions runs npm run build, the resulting dist/ folder is uploaded to Cloudflare Pages, and within seconds the new version is live worldwide.

DNS is the layer that gets the right hostname to the right hosting service. You buy a domain (bsdc.info.bd), point its nameservers at Cloudflare, then add a CNAME record from www to your Pages project. Cloudflare issues a free TLS certificate via Let's Encrypt and renews it automatically. There is no longer any excuse for shipping a site without HTTPS.

Continuous deployment means every commit to your main branch triggers an automated build and deploy. GitHub Actions YAML files (.github/workflows/*.yml) describe the pipeline: check out the code, install dependencies, run tests, build, deploy. BSDC's deploy.yml does this end-to-end with zero CLI commands needed locally. Push to main, watch the Action turn green, refresh the live URL. That's the whole loop.

Environment variables are how you keep secrets out of source code. Anything that changes between local development and production (API URLs, feature flags, API keys) lives in an environment variable. Cloudflare Pages has a UI for adding them; GitHub Actions reads them from repository secrets. The .env file in your project is for local dev only — add it to .gitignore on day one.

Observability is the last piece. You need to know when something breaks before your users tell you. Set up basic uptime monitoring (UptimeRobot, Better Uptime — many free tiers). Add error tracking (Sentry has a generous free plan). Pipe production logs somewhere queryable (Cloudflare Workers logs, Logflare, Axiom). When a user reports "the points page is slow", you should be able to pull up a trace within seconds.

Mobile deployment via Capacitor is the cherry on top. Capacitor wraps your existing web app in a native shell, lets you ship to the Google Play Store and Apple App Store, and exposes native APIs (camera, push, contacts) when you need them. BSDC's Android build runs entirely on GitHub Actions — no Android Studio, no local SDK, no CLI — and produces an APK you can sideload or submit to Play in minutes.`
    },
    {
      id: 'm10a',
      title: 'Module 10 — Testing, CI, and Daily Engineering Discipline',
      body: `A test is just a small program that runs your bigger program and asserts the result is what you expected. The benefit isn't catching bugs you already know about — it's catching the ones you'll introduce six months from now when you refactor a part of the codebase you'd half-forgotten. Tests are letters from your past self to your future self saying "I checked this; please don't break it without noticing".

There are roughly three layers. Unit tests verify a single function or component in isolation — Vitest and Jest are the most popular runners; React Testing Library handles components. Integration tests check that multiple modules work together: a typical example is mounting a component and asserting it calls an API helper with the right arguments. End-to-end (E2E) tests drive a real browser — Playwright is the modern standard — to verify whole user journeys like "I can sign in, post a comment, and see it appear". The pyramid rule is: many unit tests, fewer integration tests, very few but very meaningful E2E tests. Inverting that pyramid produces a slow suite that nobody runs.

Test names matter. "it works" is useless six months later; "rejects a transfer when the sender has insufficient points" tells you exactly what was checked and what regressed. Treat test names as the executable specification of your codebase.

Mocking is how you isolate the unit under test from its dependencies. Mock the network so tests are fast and deterministic. Mock the clock so date-based logic isn't flaky at midnight. Mock external services so a test failure points at YOUR code, not at someone else's outage. But don't over-mock — a test that mocks every collaborator only verifies the test setup, not your code.

Continuous integration (CI) runs your test suite automatically on every push. GitHub Actions is free for public repos and generous for private ones. A minimal pipeline lints, type-checks, builds, and runs tests; a richer one also runs security scans, accessibility audits, and Lighthouse performance budgets. Failing the build on a budget regression is what stops "I'll fix the perf later" from quietly becoming "the homepage takes 8 seconds on a 3G phone".

Code review is the human layer of quality. Two cultural principles make reviews productive: (1) leave more questions than statements ("Why use a transaction here?") so the author keeps ownership; (2) approve early and often — a single five-line PR reviewed in ten minutes always beats a 500-line PR reviewed in two days. Pair-program when the change is risky; review asynchronously when it isn't.

Version control hygiene compounds. Write commit messages in the imperative present tense ("add follow notification") not the past tense ("added"). Each commit should be one logical change, small enough to revert independently. Use feature branches and pull requests rather than committing to main. Rebase your branch on main before merging to keep history linear and bisectable. When a bug surfaces in production, git bisect will pinpoint the exact commit that introduced it within minutes — but only if every commit in history is well-structured.

Documentation is part of code. Every public function should have a one-sentence comment explaining WHY it exists (the WHAT is visible from the signature). Every non-obvious branch should have a one-line comment justifying it. Every module file should start with a header block describing its role in the system. BSDC's codebase follows exactly this discipline because, in three years, someone you have never met will have to extend or debug what you write today. Write for them.

Refactoring is a daily activity, not a quarterly event. The "boy scout rule" — leave the campsite cleaner than you found it — applies to every PR. Renamed something? Update the call sites. Spotted a duplicated block? Extract it. Found a magic number? Promote it to a named constant. Tiny continuous improvements compound; "refactor weeks" punctuated by chaos do not.

Finally, learn the difference between essential complexity and accidental complexity. Essential complexity is inherent to the problem ("computing a leaderboard from millions of events is hard"). Accidental complexity is what we introduce in the solution ("this code is hard because three frameworks fight over which one owns state"). Strong engineers obsess over reducing the second so they can spend their energy on the first.`
    },
    {
      id: 'm10b',
      title: 'Module 11 — Working Remotely and Building a Bangladeshi Tech Career',
      body: `Remote work has reshaped the Bangladeshi tech economy more than any policy change ever did. A Dhaka-based developer can be hired by a Berlin SaaS, a San Francisco startup, or a Sydney agency without leaving home. The same role pays vastly more in USD than in BDT, and the local cost of living turns a modest international salary into a financially transformative one. Understanding how to land and thrive in those roles is the highest-leverage skill any reader of this course can develop.

The hiring funnel for international remote roles typically runs: outreach → screening → technical interview → take-home or live coding → behavioural interview → offer. Each stage is its own skill. Outreach is half about who you know and half about whether your GitHub, LinkedIn, and personal site signal "this person is competent and easy to work with". Technical interviews lean on data-structures-and-algorithms (DSA) classics: arrays, strings, hash maps, trees, graphs, dynamic programming. Spend dedicated weeks on these — LeetCode and Codeforces are the cheapest gym memberships in the industry. Take-homes test how you build a small real feature; ship clean code with a README, tests, and a one-paragraph rationale for every non-obvious decision. Behavioural rounds use the STAR format — Situation, Task, Action, Result — and look for self-awareness, low ego, and the ability to disagree without being disagreeable.

Time zones are the daily reality. A Bangladeshi developer working for a US-east-coast team usually overlaps 8pm–11pm local time. A European team typically overlaps midday onward. Many teams are "async-first" — written communication is the default; meetings are rare and recorded. The biggest career boost in async-first culture is becoming a great writer. Send tighter Slack messages. Use bullet points and code blocks. Lead with the conclusion, follow with the reasoning. The instinct to write a polite Bangla-style preamble before getting to the point is a habit worth deliberately re-tuning.

Payment is the other tricky bit. Direct bank transfer via SWIFT is the slowest and most expensive option. Wise (formerly TransferWise) is dramatically cheaper but recipients in Bangladesh face daily limits and BDT conversion. Payoneer is the most common pragmatic choice — it issues a USD account, employers wire to it, and you withdraw to a local bank in BDT at a reasonable rate. Some developers route through Deel or Remote for full payroll compliance. Read each option's terms carefully and budget for ~3-5% in unavoidable conversion fees.

Taxes deserve attention from day one. Bangladesh allows foreign-source income but expects you to declare and pay tax above the basic exemption. Hire an accountant for the first year; the cost is trivial compared to the audit risk. Keep digital records of every contract and every wire. The penalty for "I'll figure it out later" can be years of back taxes plus interest.

Soft skills make or break a remote career. Over-communicate proactively — when you're stuck, when you'll be late, when you finished early. Default to camera-on for video calls. Ask clarifying questions in writing before you start a task. Submit a draft PR early so reviewers can steer direction rather than rejecting a finished product. Take ownership of mistakes publicly and without drama; the engineers who admit "I broke production today, here's what I'm doing to fix it" earn more trust than those who hide problems.

Specialise once you have breadth. After 18 months of full-stack work, pick a vertical: payments, real-time systems, ML infrastructure, security, developer tooling, data engineering, mobile. Specialists earn 30–60% more than generalists and have a smaller, friendlier interview circuit. Bangladeshi developers are especially well-positioned in payments (because we understand mobile-money first-hand) and in language/locale work (because we straddle two scripts daily).

Network deliberately. Attend one online dev event per month. Show up to BSDC monthly meetups. Send a thoughtful cold email to two engineers a week — most people enjoy answering one specific, well-researched question from a stranger. The job offer that changes your life will almost certainly come from a referral, not an application.

Finally, take care of yourself. Remote work erases the commute but also the "off" switch. Set fixed hours. Take a real lunch. Walk in the evening. Sit with your family. The career compounds over decades, not quarters. The most productive engineers I know in Bangladesh and abroad protect their evenings ferociously and treat eight hours of sleep as non-negotiable.

You now have the map. The territory is yours to walk. Build, share, ask, teach, repeat — and welcome to BSDC.`
    },
    {
      id: 'm10c',
      title: 'Module 12 — Architecture Patterns Every Bangladeshi Developer Should Know',
      body: `Architecture is what your codebase looks like from ten thousand feet. Most projects don't fail at the line-of-code level; they fail because the high-level structure couldn't evolve to match new requirements. Learning a small repertoire of proven patterns and — equally important — knowing when NOT to apply them is what graduates you from "coder" to "engineer".

The most useful starting pattern is layered architecture. You split your codebase into horizontal layers: presentation (UI), application (use-cases), domain (business rules), infrastructure (database, queues, third-party services). Dependencies point downward only — the UI may call use-cases, use-cases may call domain, domain may call infrastructure through an interface. This single discipline makes 80% of refactors safe because you can swap one layer (say, replace Firestore with Postgres) without touching the others. The cost is a slight upfront investment in interfaces and folder discipline; the payoff is years of low-friction change.

Hexagonal (or "ports and adapters") architecture is the natural evolution. Your business logic is a hexagon in the middle; every external concern (HTTP, database, queue, push notifications) is an adapter that plugs into a port. You can run your business rules in a unit test with all adapters mocked, and you can swap any adapter without touching the core. BSDC's data layer (firestore.js, realtimeDb.js) is essentially a port: every UI component talks to those helpers, never to Firebase directly. If we decided tomorrow to back the points engine with Postgres, we'd rewrite ONE file.

CQRS — Command Query Responsibility Segregation — sounds intimidating but is straightforward: separate the code that CHANGES state (commands) from the code that READS state (queries). Commands tend to be transactional, validated, audited; queries tend to be fast, denormalised, cached. In a small app you can have both in the same module; in a larger one they diverge into different services. BSDC's feed already lives this pattern: posts are normalised when written but a denormalised author-snapshot is included so reads don't need a JOIN.

Event-driven architecture flips the request/response model: components emit events ("UserFollowed", "PostLiked") and listeners react. The advantage is decoupling — the like handler emits an event; the points engine, notification engine, and feed-ranker all listen independently. The risk is harder debugging because the flow is not a single call stack. Use events when the side-effects truly are independent; use direct calls when they aren't.

State machines are underrated. A subscription can be in "trial", "active", "past_due", "cancelled". Each state allows specific transitions ("trial → active" via "pay"; "active → cancelled" via "user cancels"). Modelling this explicitly with a library like XState (or even a switch statement) eliminates entire classes of bugs where impossible transitions occur. BSDC's verification flow (none → pending → approved/rejected) is a small example.

Caching is a pattern, not a feature. Three classic strategies: cache-aside (app reads cache, fills from DB on miss), write-through (every write goes to cache and DB), and write-behind (writes go to cache; a background job persists to DB later). Each has trade-offs around consistency, latency, and durability. Always cache with a TTL — infinite caches inevitably become "why does prod show stale data" bugs. Browsers cache aggressively too; Cloudflare's _headers file from Response 1 tunes those caches for BSDC's exact mix of HTML, hashed assets, and dynamic XML.

Idempotency is the unsung hero of distributed systems. An idempotent operation can be called many times with the same input and produce the same effect once. Use idempotency keys for payments, point transfers, and external API calls so a retry after a network blip cannot double-charge the user. BSDC's daily-login bonus uses a dedupeKey for exactly this reason.

Backpressure prevents fast producers from drowning slow consumers. If your feed-ranking job lags during a viral spike, queue new posts rather than letting the worker pool exhaust memory. Tools like BullMQ, RabbitMQ, or Kafka give you durable queues; lighter apps can lean on Firestore writes as an implicit queue.

Multi-tenancy is the design choice of whether one customer's data is isolated by row (a tenant_id column on every row) or by schema (a separate schema per tenant) or by database (a fully separate DB per tenant). Row-level is cheap and fast to ship; database-level is expensive but unblocks compliance for enterprise customers. Pick consciously; migrating later is painful.

Observability is three pillars: metrics (numerical, aggregated — "p95 request latency"), logs (timestamped events — "user 42 transferred 100 points to user 99"), and traces (a single request's full path across services). You need all three. Metrics tell you SOMETHING is wrong; logs and traces tell you WHAT. Tools like Sentry, Honeycomb, OpenTelemetry, and Grafana cover the space; pick the free tier that fits your stack and instrument from day one.

Cost-aware architecture is a uniquely 2026 concern. Cloud bills can balloon overnight if you fan out work unnecessarily. Before designing a system, ask: how many DB reads per page view? How many MB of egress per user? What does a 10x traffic spike cost? Firestore in particular has surprising read costs when feeds aren't structured carefully; that's why BSDC denormalises author data onto posts and uses a single counter document for live online users instead of COUNT queries.

Security architecture is its own discipline. Apply the principle of least privilege everywhere — Firestore rules from Response 1 enforce that users can only edit their own posts, admins gate moderation actions, and verification documents are admin-only. Encrypt sensitive data at rest. Rotate secrets on a schedule. Treat any service account JSON file like cash. Review your IAM policies quarterly.

Choosing the right architecture matters less than choosing CONSISTENTLY. A simple, well-applied pattern beats a sophisticated, inconsistently-applied one every time. Pick a small set of conventions, document them in a README, enforce them in code review, and let your codebase grow gracefully.

Two anti-patterns to actively avoid: (1) "Microservices on day one" — splitting a tiny app into ten services before you understand the domain creates ten times the operational pain for none of the benefit. Start as a modular monolith; extract services only when team boundaries or scale demand it. (2) "Resume-driven development" — picking the trendiest stack to look good on a CV rather than the one that fits the problem. Boring technology — Postgres, plain HTML, server-rendered React — is the secret of most successful products.

When you reach senior level, the question stops being "how do I write this code?" and becomes "what code should we write at all?". Pushback on requirements is part of the job. Many features can be solved with a config flag instead of a new screen. Many "performance problems" disappear with a one-line index. Many "we need a microservice" conversations end with "actually, a queue handler in the existing app is enough". The engineer who saves the team a quarter of work by not building the wrong thing is more valuable than the engineer who heroically delivers it on time.

That mindset — pragmatic, evidence-driven, allergic to complexity for its own sake — is the through-line of every great engineer I have worked with, in Bangladesh and abroad. Adopt it early and the rest of the technical depth will compound on top.`
    },
    {
      id: 'm10d',
      title: 'Module 13 — Mobile, PWAs, and Shipping to Android',
      body: `By 2026 more than 90% of internet users in Bangladesh access the web from a phone first. Designing mobile-first is not a stylistic preference; it is the only honest way to build for the audience that actually exists. That means starting every component layout at 320 pixels wide and only adding desktop refinements once the mobile experience feels right. BSDC's responsive system goes from 250 to 5000 pixels precisely so a budget Symphony Android at the lower end and a 4K monitor at the upper end both look intentional.

A Progressive Web App (PWA) is a regular web app that, with three additions, behaves like a native app: a Web App Manifest (manifest.json), a service worker for offline support and push notifications, and HTTPS hosting. The manifest tells the browser the app's name, icon, theme color, and start URL — that's how "Install BSDC" appears in the address bar. The service worker is a JavaScript file that runs in a background thread, intercepts network requests, caches responses, and powers offline mode. BSDC ships a OneSignalSDKWorker.js for push and uses Cloudflare Pages' built-in caching for offline-friendly behaviour without a custom worker.

The install prompt is opt-in. After the user has spent a few minutes on the site we can call beforeinstallprompt to suggest installation. Don't pop it on first visit — users haven't earned trust yet. PWAs install to the home screen, open in their own window, can receive push notifications, and on modern Android can integrate with the share sheet, contacts, and even payments.

When you need true native capabilities (Bluetooth, exact background location, deep file system access), wrap the PWA in Capacitor. Capacitor is a Cordova successor that lets you ship the same React codebase to Android and iOS by compiling it inside a WebView with a plugin bridge. The killer feature: there's almost no extra code. BSDC's capacitor/ folder configures the Android build; the GitHub Actions workflow we set up in Response 1 produces a signed APK on every push to main, without any developer needing Android Studio locally. Submit that APK to Google Play, and BSDC has a real mobile app.

Performance on mid-range Android devices is the discipline that separates "works in dev" from "delights real users". Three rules: keep the initial JavaScript bundle under 200 KB gzipped (BSDC's vendor chunking does most of the work); avoid layout thrash by animating transform and opacity only; lazy-load every image below the fold. Test on a throttled "Fast 3G" profile in DevTools — if the app feels laggy on the simulated connection it'll be unusable in rural Khulna.

Touch ergonomics matter. Make every tap target at least 44 by 44 CSS pixels (Apple's HIG number) so users don't fat-finger the wrong link. Keep primary actions in the lower third of the screen where the thumb naturally rests. Use the bottom navigation pattern for the four or five most-used destinations; reserve the top bar for context and search. BSDC's mobile bottom nav has exactly five slots — Home, Explore, Compose, Notifications, Me — for this reason.

Input methods matter too. Type="email" gives an @ key. Type="tel" gives a number pad. Type="search" gives a magnifier icon and a clear button. autocomplete="one-time-code" lets iOS and Android auto-fill the SMS code without leaving the keyboard. autocomplete="new-password" suggests a strong password and saves it. These five-second tweaks have measurable conversion-rate impact.

Accessibility is the most underrated mobile concern. Screen readers (TalkBack on Android, VoiceOver on iOS) are used not only by blind users but also by users with cognitive disabilities and even sighted users in eyes-busy contexts like driving. Use semantic HTML, label every form field, provide alt text for every image, ensure focus order matches visual order, and make sure your colour contrast clears WCAG AA (4.5:1 for body text, 3:1 for large text). The Lighthouse accessibility audit in Chrome DevTools will catch most issues in seconds.

Low-bandwidth design is a Bangladeshi specialty. Image-heavy pages eat data plans. Compress aggressively — WebP at quality 75 looks identical to PNG at a quarter the size. Use srcset to serve mobile users a 480px image while desktop users get the 1600px version. Cache aggressively. Show skeleton placeholders while data loads so the page feels responsive even on slow networks. BSDC's .bsdc-skeleton class is for exactly this.

Battery and memory are the silent killers on cheap phones. Heavy animations, large React trees, and aggressive polling all drain battery and trigger Android's "this app is using a lot of battery" warning. Pause your IntersectionObserver when the tab is hidden via document.visibilityState. Throttle expensive renders behind requestIdleCallback. Memoize big lists with useMemo. These optimisations cost almost nothing to write and dramatically improve real-world retention.

Push notifications need careful UX. Never auto-prompt on first visit; instead show a custom banner after the user has had a positive interaction and let them tap a button to trigger the native permission prompt. Once granted, send notifications sparingly — one per day from the system bar feels useful; ten per day feels like spam and they will turn it off forever. BSDC's setupOneSignalForUser hook from Response 7 follows exactly this pattern.

Releases must be safe. The web is your most forgiving platform — a bad deploy can be rolled back in seconds via Cloudflare Pages. Mobile is less so — once an APK is on a user's phone, you cannot pull it. Use feature flags so risky features can be turned off remotely. Use staged rollouts on Play Store (10% → 25% → 100% over a week). Always include a kill switch — a server-side variable your app reads on launch — for any feature that touches money or critical UX.

The Bangladeshi mobile market is unique. Most users have prepaid data plans counted in megabytes, not gigabytes. Many devices have only 2 or 3 GB of RAM. Cellular networks are crowded in cities and weak in villages. WhatsApp, Imo, and bKash are the apps people open dozens of times a day. Designing software that respects those constraints — small, fast, polite, useful — is the surest path to a product Bangladeshis will actually love.`
    },
    {
      id: 'm10e',
      title: 'Module 14 — Working with AI Coding Assistants',
      body: `By 2026 every working developer in Bangladesh and beyond is an AI-augmented developer whether they realise it or not. The professional landscape has shifted permanently, and the developers who will define the next decade are the ones who learn to collaborate with machines without surrendering their judgement to them. GitHub Copilot, ChatGPT, Claude, Gemini, Cursor, and a dozen smaller tools have become as standard as syntax highlighting. The question is no longer "should I use AI?" but "how do I use it well?".

The first principle is to treat AI like a fast, confident, occasionally-wrong junior developer. It can produce boilerplate, suggest API names, draft tests, and propose refactors faster than you can think. But it can also confidently invent functions that don't exist (called "hallucination"), suggest insecure patterns, and miss subtle bugs that a careful human would catch. Your job is to verify everything before it lands in main.

The biggest productivity win is using AI for the things humans hate but computers do well: writing boilerplate, documenting code, generating test cases, translating between languages, summarising long files, explaining unfamiliar APIs. A senior engineer who used to spend two hours writing test scaffolding now spends fifteen minutes prompting and reviewing. That two-hour gap, multiplied across a team, is real economic value.

Prompt quality matters. A vague "write a login form" gets a generic answer. A specific "write a React 18 login form using react-hook-form for validation, Firebase Auth for the sign-in, and Tailwind for styling, with Bangla and English labels switchable via a language prop" gets something nearly drop-in. Lead with the constraints (frameworks, conventions, design system); end with the success criteria.

Context windows have exploded. You can now paste an entire file (or several) into a prompt and ask for cross-file refactors. Tools like Cursor and GitHub's repository-aware Copilot do this automatically by indexing your codebase. The result is suggestions that match YOUR conventions, not generic StackOverflow ones. BSDC's heavily-commented file headers exist partly so AI tools can immediately understand what each module is for.

AI is a force multiplier for code review. Before submitting a PR, ask an AI to review your diff with prompts like "What edge cases am I missing?" or "Are there any security issues with this query?". You'll catch obvious mistakes before a human reviewer sees them and uses their precious attention on the subtle ones.

Where AI struggles in 2026: novel algorithm design, complex distributed-systems reasoning, large refactors that span unfamiliar code, and anything requiring tacit company-specific knowledge. Don't outsource those — outsource the typing, keep the thinking.

The ethical and professional bar is unchanged. Code you submit is your code, regardless of whether you typed it or accepted it from a model. You are responsible for its correctness, its security, its licence compliance, and its long-term maintainability. "The AI wrote it" is not a defence in production.

Privacy is a real concern. Don't paste production secrets, customer data, or proprietary algorithms into a public AI chat. Many companies now run self-hosted models for exactly this reason. For BSDC, treat user content and verification documents as off-limits to third-party AI tools, period.

Career-wise, the developers who thrive will be those who use AI to amplify their existing engineering judgment. The developers who suffer will be those who treated AI as a replacement for that judgment. The middle of the bell curve — average coders — is what AI eats. The bottom (people who couldn't ship at all) and the top (people whose value was always in design and judgment) are largely safe and arguably amplified.

A practical daily workflow with AI looks like this: write a short design doc by hand; ask AI to critique it; iterate; ask AI to scaffold the implementation; review the diff carefully and make the dozen small corrections it will need; write the tests yourself or co-write with AI; run the suite; commit with a clear human-written message; open the PR; ask AI to summarise the diff for the description; let your human reviewer focus on architecture and trade-offs rather than typos.

Bangladeshi developers are remarkably well-positioned in this transition. English fluency means we can leverage every cutting-edge tool the day it ships. A culture of self-teaching means we adapt quickly. A growing remote-work ecosystem means our work is judged on output rather than presence, which is exactly the dimension AI augments most. The next five years are the best time in a generation to be a Bangladeshi developer who takes the craft seriously.

Use AI. Don't worship it. Don't fear it. Verify everything. Take the typing wins, keep the thinking. That's the whole game.`
    },
    {
      id: 'm10f',
      title: 'Module 15 — A Closing Note from the BSDC Team',
      body: `Reaching this point in the course is itself a meaningful achievement. The previous fourteen modules covered ground that, fifteen years ago, would have taken a full undergraduate degree to traverse. The fact that you absorbed it for free, on a phone, in your own time, in a country where English-medium technical content was historically scarce, is not a small thing. We hope you take a moment to feel proud, and then we hope you immediately put it to use.

The Bangladeshi software industry is at an inflection point. Local product companies are scaling beyond the South Asian market for the first time. International employers are hiring Dhaka and Chittagong-based engineers in numbers that would have been unimaginable a decade ago. Bootstrapped indie developers are launching SaaS products from their bedrooms and reaching paying customers on every continent. The infrastructure — cheap cloud, free CDNs, generous AI tooling, Cloudflare Pages, GitHub Actions, Firebase free tiers — has never been more accommodating to a solo developer with a laptop and an idea. The barriers that defined our parents' generation of engineers (expensive servers, licensing fees, gatekeeping by foreign certifications) are simply gone.

What remains is what has always mattered: care, curiosity, and consistency. The engineer who reads the documentation carefully will out-ship the one who guesses. The engineer who writes a comment explaining why will outlast the one who explains how. The engineer who shows up every weekday for ten years will compound past the prodigy who burns out in eighteen months. The Bangla word for this kind of patient accumulation is a good one: dheery. Be dheery. The career is long.

We would also like to make one specific request of you. Once you have your certificate, once you have shipped a project or two, once a recruiter has noticed you — come back to BSDC and write a post about how you did it. Mentor one developer who is two years behind where you are now. Answer one question you used to ask. Open one issue on a project you care about. The platform you are reading this on exists because people who came before you did exactly that, and the only way it stays vibrant is if you do the same. Bangladesh's technical community grows or shrinks based on whether each generation chooses to lift the next one.

A few specific commitments will set you apart from the median Bangladeshi developer. Commit to writing at least one blog post a month on BSDC — even a short one. Commit to opening at least one pull request a quarter on an open-source project you use daily. Commit to attending at least one community event per month, online or in person. Commit to reading one technical book per quarter. Commit to keeping your CV updated even when you are not job-hunting. Commit to reviewing one junior developer's pull request each week with patience and respect. Commit to learning enough Bangla technical vocabulary that you can explain your work to your family without switching to English mid-sentence; the cultural confidence of being able to do this is more career-shaping than people realise. Commit to saving and investing at least twenty percent of any income above your basic living costs; a financially secure engineer can take career risks a cash-strapped one cannot, and those risks are where the upside lives. Commit to one annual learning expedition out of your day-to-day stack — a weekend deep-dive into Rust, or game development, or distributed systems papers — because that lateral exposure compounds in unexpected ways. These small disciplines compound into a career that opens doors you cannot currently see.

Finally, a personal note. The team behind BSDC built this platform because we wished it had existed when we were starting out. We were the developers who memorised W3Schools tutorials at internet cafes, who wrote first-job CVs in Notepad, who lurked in foreign Discord servers because there was no local equivalent, who learned everything we know by trying, failing, and asking strangers for help. Every single one of us would have killed for a free, comprehensive, Bangla-friendly community in our early years. That is what we hope BSDC becomes for you, and for the developer two years behind you, and the one ten years behind you.

Welcome to the craft. Welcome to the community. The rest is up to you. The course ends here, but the work is only beginning, and every developer reading this is now part of an unbroken chain of teachers, learners, builders, and mentors that stretches back to the earliest days of computing and forward as far as any of us can see. Make something. Share it. Teach what you learn. We will be here, on BSDC, cheering you on as you grow from your first deployed page to your first paid contract, from your first pull request to your first open-source maintainer role, and from your first beginner question to your first thoughtfully-answered mentee. The story of Bangladeshi software development over the next decade is being written right now, by people exactly like you, one small kind deliberate action at a time.`
    },
    {
      id: 'm10',
      title: 'Module 16 — Career, Open Source, and Community',
      body: `Technical skill alone is not enough. The developers who go furthest combine craft with two other muscles: visible work and generous community. Both compound over years and start paying back unexpected dividends — referrals, talks, mentorship, job offers — long after you stop tracking them.

Build in public. Every project you finish, post about it on BSDC. Share what you learned, what went wrong, what you'd do differently. The vast majority of developers — including those at top companies — feel imposter syndrome about sharing publicly. Push past it. Your beginner's mistakes are someone else's "wait, that was the bit I didn't get". Your six-month-later refactor is a teaching moment for the version of you that existed before. Bangladeshi developers in particular are underrepresented in global tech discourse; every blog post in English or Bangla nudges the needle.

Open source is the world's largest distributed mentorship program. Pick a project you use — Vite, Firebase, React Router — and read its issue tracker. Find a "good first issue" label, read the contributing guide, set up the project locally, write a fix, open a pull request. The first one is terrifying; the tenth feels routine. You will learn more from one merged PR to a well-run project than from a month of tutorials.

Networking in 2026 is mostly online. Twitter/X is still where the dev industry argues. LinkedIn is where recruiters live. GitHub is your portfolio. Discord, Slack, and Telegram host most active developer communities — BSDC's channels feature exists for exactly this. Show up, be useful, answer questions you know the answer to, ask good questions when you don't. Three months of consistent presence in a small community will introduce you to more peers than three years of silent scrolling.

Compensation is taboo in Bangladesh but Worth Discussing Out Loud. Junior developers in Dhaka earn 25,000–60,000 BDT/month at local agencies, 60,000–150,000 at well-funded startups and product companies, and significantly more when working remotely for foreign employers (often in USD or EUR). The path from one tier to the next is almost always a combination of public work (blog posts, open source) and intentional skill leveling (going deep on one specialty). Salaries roughly double when you cross the "remote-for-international-company" threshold because the local cost of living arbitrage is huge in our favour.

Burnout is real and common. The industry rewards visible output, which tempts you to work nights and weekends. Don't. Aim for sustainable 40–45 hour weeks plus one focused side-project. Sleep eight hours. Walk every day. The cumulative effect of compounding output over ten years dwarfs the apparent advantage of a few sprint-heroic months. Senior engineers all eventually learn this; some learn it the hard way.

Finally, give back. Mentor the next batch through their first bugs. Answer questions on BSDC. Write the blog post you wish had existed when you were stuck. The Bangladeshi tech ecosystem is still small enough that one consistent contributor moves the whole community. That contributor can be you.`
    }
  ],
  questions: [
    {
      question: 'Which HTTP status code means the resource was not found?',
      options: ['200', '301', '404', '500'],
      correct: 2
    },
    {
      question: 'Which port is the standard for HTTPS?',
      options: ['80', '443', '8080', '22'],
      correct: 1
    },
    {
      question: 'Which HTML tag should you use for the most important heading on a page?',
      options: ['<h1>', '<h2>', '<header>', '<title>'],
      correct: 0
    },
    {
      question: 'In CSS, which property is best for one-dimensional layouts like a nav bar?',
      options: ['display: grid', 'display: flex', 'float: left', 'position: absolute'],
      correct: 1
    },
    {
      question: 'Which keyword declares a variable that can be re-assigned but is block-scoped?',
      options: ['var', 'let', 'const', 'static'],
      correct: 1
    },
    {
      question: 'What does the React useEffect hook do?',
      options: [
        'Stores reactive state in a component',
        'Runs side-effects after render',
        'Memoises an expensive computation',
        'Creates a custom hook'
      ],
      correct: 1
    },
    {
      question: 'Which key prop value should you AVOID for React list items when possible?',
      options: [
        'A unique database ID',
        'A composite key like `${userId}-${postId}`',
        'The array index',
        'A UUID'
      ],
      correct: 2
    },
    {
      question: 'Which is the correct way to write an asynchronous function that awaits a promise?',
      options: [
        'function load() { await fetch() }',
        'async function load() { await fetch() }',
        'function load() { sync fetch() }',
        'async load => fetch()'
      ],
      correct: 1
    },
    {
      question: 'In REST, which HTTP verb is used to update fields on an existing resource?',
      options: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      correct: 2
    },
    {
      question: 'What is the main reason Firestore encourages denormalising author data onto a post document?',
      options: [
        'It saves storage space',
        'It reduces the number of document reads needed to render a feed',
        'It makes writes faster',
        'It is required by Firebase Rules'
      ],
      correct: 1
    },
    {
      question: 'Which database feature guarantees that two writes either both succeed or both fail?',
      options: ['An index', 'A view', 'A transaction', 'A foreign key'],
      correct: 2
    },
    {
      question: 'Which is the most reliable defence against SQL injection?',
      options: [
        'Escaping single quotes by hand',
        'Using parameterised queries / prepared statements',
        'Running on HTTPS',
        'Encrypting the database at rest'
       ],
      correct: 1
    },
    {
      question: 'Which Core Web Vital metric measures how stable the visual layout is during loading?',
      options: ['Largest Contentful Paint', 'First Input Delay', 'Cumulative Layout Shift', 'Total Blocking Time'],
      correct: 2
    },
    {
      question: 'What does CDN stand for?',
      options: [
        'Cached Data Network',
        'Content Delivery Network',
        'Compressed Document Node',
        'Centralised Domain Naming'
      ],
      correct: 1
    },
    {
      question: 'Why does BSDC store points-related changes inside a Firestore runTransaction?',
      options: [
        'To avoid paying for the operation',
        'To make the writes faster than a normal update',
        'To prevent race conditions and double-spends',
        'To bypass Firebase security rules'
      ],
      correct: 2
    },
    {
      question: 'Which file in a Cloudflare Pages project handles SPA fallback?',
      options: ['_headers', '_redirects', 'vite.config.js', '.cloudflare.json'],
      correct: 1
    },
    {
      question: 'Which Schema.org @type best describes a question-and-answer post?',
      options: ['Article', 'QAPage', 'BlogPosting', 'Review'],
      correct: 1
    },
    {
      question: 'Which is the correct way to lazy-load an image in HTML?',
      options: [
        '<img src="..." async>',
        '<img src="..." loading="lazy">',
        '<img defer src="...">',
        '<img src="..." load="deferred">'
      ],
      correct: 1
    },
    {
      question: 'Which strategy keeps an initial JavaScript bundle small for fast mobile loads?',
      options: [
        'Putting all code in one file',
        'Lazy-loading routes with React.lazy + Suspense',
        'Disabling minification',
        'Avoiding npm packages entirely'
      ],
      correct: 1
    },
    {
      question: 'What is the most important habit for long-term developer career growth?',
      options: [
        'Switching jobs every six months',
        'Working 80-hour weeks',
        'Building visibly in public and contributing to community',
        'Never asking questions so you look smart'
      ],
      correct: 2
    }
  ]
};

/** Convert modules array to a single body string used by readers. */
export function modulesToBody(course) {
  return (course.modules || []).map((m) => `## ${m.title}\n\n${m.body}`).join('\n\n');
}

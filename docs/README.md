# srb-api – Architecture diagrams

Study Room Booking Service – Syed Shahzaib Haider Rizvi (FA23-BAI-050)

All diagrams live in one draw.io file: [`srb-architecture.drawio`](./srb-architecture.drawio).
It has three pages (tabs at the bottom of the draw.io window):

| # | Page | What it shows |
|---|------|---------------|
| 1 | **Deployment** | UML deployment diagram. The client device (web browser running `board.html` / `admin.html`, plus Postman as the REST/GraphQL client), the application server (Node.js running the `srb-api` Express 5 app with the REST API `/api/v1`, GraphQL `POST /graphql` (Apollo Server), the Socket.IO server (default namespace with rooms per `roomCode`, `/admin` namespace that requires `adminKey`) and static files) and the database server (MongoDB, database `srb`). Links are labelled with their protocols: HTTP/1.1 on port 3000, Socket.IO WebSocket, and the MongoDB wire protocol on TCP 27017. A note lists the `.env` settings (`PORT`, `MONGODB_URI`, `ADMIN_KEY`). |
| 2 | **ER Diagram** | The entities `Room`, `Slot`, `Student` and `Booking`, with their PK, FK and unique keys, in crow's-foot notation: Room 1–0..* Slot, Slot 1–0..* Booking, Student 1–0..* Booking. `Booking` is the associative entity that resolves Student M:N Slot. The capacity rule `booked ≤ seats` is shown as a note. |
| 3 | **Sequence: Book a slot** | `POST /api/v1/students/:regNo/bookings`, traced through the controller, `bookings.service` and MongoDB. `alt` fragments cover these cases: student not found (404), slot not found (404), already booked (409 `ALREADY_BOOKED`), and the atomic `findOneAndUpdate`, which either finds the slot full (409 `SLOT_FULL`) or takes a seat. When a seat is taken, the service creates the booking, emits `slot:updated` to Socket.IO room `ROOM-01` only, and returns 201 Created. |

## How to open

- **draw.io desktop**: install it from <https://www.drawio.com/>, then go to **File → Open** and choose `docs/srb-architecture.drawio`.
- **Browser**: go to <https://app.diagrams.net>, then **File → Open From → Device…** and choose `docs/srb-architecture.drawio`. You can also drag the file onto the page.
- **VS Code**: the *Draw.io Integration* extension (`hediet.vscode-drawio`) opens the file directly.

Use the page tabs at the bottom to move between the three diagrams. To export one, use **File → Export as → PNG/PDF**.

The file is plain, uncompressed draw.io XML, so you can diff and review it in git.

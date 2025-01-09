Cursor Backend Setup mssnglnk-app

Backend Setup Instructions

Use this guide to setup the backend for this project.
It uses Supabase, Drizzle ORM, and Server Actions.
Write the complete code for every step. Do not get lazy. Write everything that is needed.

On the frontend, I have set the Next.js as the main framework for this project. I want to use the App Router page management.
I want every page in this project to use the Johnston100 font.

Your goal is to completely finish the backend and frontend setup.


Helpful Links

If the user gets stuck, refer them to the following links:
- [Supabase Docs](https://supabase.com)
- [Drizzle Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle with Supabase Quickstart](https://orm.drizzle.team/learn/tutorials/drizzle-with-supabase…)

Install Libraries

Make sure the user knows to install the following libraries:
```bash
npm i drizzle-orm dotenv postgres
npm i -D drizzle-kit
```

## Setup Steps

- [ ] Create a `/db` folder in the root of the project

- [ ] Create a `/types` folder in the root of the project

- [ ] Add a `drizzle.config.ts` file to the root of the project with the following code:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
schema: "./db/schema/index.ts",
out: "./db/migrations",
dialect: "postgresql",
dbCredentials: {
url: process.env.DATABASE_URL!
}
});
* Add a file called db.ts to the /db folder with the following code:
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { airportTrainScheduleTable } from "./schema";

config({ path: ".env.local" });

const schema = {
airportTrainScheduleTable
};

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
```

- [ ] Create 2 folders in the `/db` folder:
  - `/schema`
  - `/queries`

- [ ] Add a file called `index.ts` to the `/schema` folder

- [ ] Create a table in the `/schema` folder called `passenger-schema.ts` with the following code:

```ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const passengerTable = pgTable(“passenger”, {
id: uuid("id").defaultRandom().primaryKey(),
name: text(“name”).notNull(),
email: text(“email”).notNull(),
phone: text(“phone”).notNull(),
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at")
.notNull()
.defaultNow()
.$onUpdate(() => new Date())
});

export type InsertPassenger = typeof passengerTable.$inferInsert;
export type SelectPassenger = typeof passengerTable.$inferSelect;
```

* Export the passenger table in the /schema/index.ts file like so:
```ts
export * from “./passenger-schema";
```

* Create a new file called passenger-queries.ts in the /queries folder with the following code:

```ts
"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { InsertPassenger, SelectPassenger } from "../schema/passenger-schema";
import { passengerTable } from "./../schema/passenger-schema";

export const createPassenger = async (data: InsertPassenger) => {
try {
const [newPassenger] = await db.insert(passengerTable).values(data).returning();
return newPassenger;
} catch (error) {
console.error("Error creating passenger:”, error);
throw new Error("Failed to create passenger ”);
}
};

export const getPassengerById = async (id: string) => {
try {
const passenger = await db.query.passengerTable.findFirst({
where: eq(passengerTable.id, id)
});
if (!passenger) {
throw new Error(“Passenger  not found");
}
return passenger ;
} catch (error) {
console.error("Error getting schedule by ID:", error);
throw new Error("Failed to get the schedule requested!“);
}
};

export const getAllPassenger = async (): Promise<SelectPassenger[]> => {
return db.query.passengerTable.findMany();
};

export const updatePassenger = async (id: string, data: Partial<InsertPassenger>) => {
try {
const [updatedPassenger] = await db.update(passengerTable).set(data).where(eq(passengerTable.id, id)).returning();
return updatedPassenger;
} catch (error) {
console.error("Error updating passenger:”, error);
throw new Error("Failed to update passenger ”);
}
};

export const deletePassenger = async (id: string) => {
try {
await db.delete(passengerTable).where(eq(passengerTable.id, id));
} catch (error) {
console.error("Error deleting passenger:”, error);
throw new Error("Failed to delete passenger ”);
}
};
```

* In package.json, add the following scripts:

```json
"scripts": {
"db:generate": "npx drizzle-kit generate",
"db:migrate": "npx drizzle-kit migrate"
}
```

* Run the following command to generate the tables:

```bash
npm run db:generate
```
* Run the following command to migrate the tables:

```bash
npm run db:migrate
```

* Create a folder called `/actions` in the root of the project for server actions
* Create a folder called `/types` in the root of the project for shared types
* Create a file called `action-types.ts` in the `/types/actions` folder for server action types with the following code:
* Create file called `/types/index.ts` and export all the types from the `/types`    folder like so:

```ts
export * from "./action-types";
```

* Create a file called passenger-actions.ts in the /actions folder for the passengerTable’s actions:

```ts
"use server";

import { createPassenger, deletePassenger, getAllPassenger, getPassengerById, updatePassenger } from "@/db/queries/passenger-queries";
import { InsertPassenger } from "@/db/schema/passenger-schema";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";

export async function createPassengerAction(data: InsertPassenger): Promise<ActionState> {
try {
const newPassenger = await createPassenger(data);
revalidatePath(“/passenger”);
return { status: "success", message: “Passenger created successfully", data: newPassenger };
} catch (error) {
return { status: "error", message: "Failed to create passenger” };
}
}

export async function getPassengerByIdAction(id: string): Promise<ActionState> {
try {
const passenger = await getPassengerById(id);
return { status: "success", message: “Passenger retrieved successfully", data: passenger };
} catch (error) {
return { status: "error", message: "Failed to get passenger” };
}
}

export async function getAllPassengerAction(): Promise<ActionState> {
try {
const passenger = await getAllPassenger();
return { status: "success", message: “Passenger retrieved successfully", data: passenger };
} catch (error) {
return { status: "error", message: "Failed to get passenger” };
}
}

export async function updatePassengerAction(id: string, data: Partial<InsertPassenger>): Promise<ActionState> {
try {
const updatedPassenger = await updatePassenger(id, data);
revalidatePath(“/passenger”);
return { status: "success", message: “Passenger updated successfully", data: updatedPassenger };
} catch (error) {
return { status: "error", message: "Failed to update passenger” };
}
}

export async function deletePassengerAction(id: string): Promise<ActionState> {
try {
await deletePassenger(id);
revalidatePath(“/passenger”);
return { status: "success", message: “Passenger deleted successfully" };
} catch (error) {
return { status: "error", message: "Failed to delete passenger” };
}
}
```

* Create a file called action-types.ts in the `/types/actions` folder for server action types with the following code:

```ts
export type ActionState = {
status: "success" | "error";
message: string;
data?: any;
};
```

*Follow the above pattern and create three additional schema and queries files with the following names:
- `flight-schema.ts`
- `flight-queries.ts`
- `flight-actions.ts`
- `airline-schema.ts`
- `airline-queries.ts`
- `airline-actions.ts`
- `proposal-schema.ts`
- `proposal-queries.ts`
- `proposal-actions.ts`

* Implement the server actions in the `/app/page.tsx` file to allow for manual testing.
* The backend is now setup.

Last but not least, on the `/src/app/page.tsx`, establish a simple form which will ask the website visitor about four things:
1. A dropdown which will have a label called “Departure Airport/City”
2. A date picker dropdown which will have a label called “Departure Date”
3. A dropdown which will have a label called “Arrival Airport/City”
4. A date picker dropdown which will have a label called “Arrival Date”
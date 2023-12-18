# Remark

Remark is your bookmark and notebook for all your online reading.

## About

I built this project with Remix, an awesome React meta-framework. I also used Prisma as a database client, and wrote the code in TypeScript. The design is implemented using TailwindCSS, this was my first time using it. This application runs in production on [remark.jensmeindertsma.com](https://jensmeindertsma.com/). Every commit goes through a CI process and if all checks pass the changes are automatically deployed to the Droplet running Dokku.

## Setting up

This project uses PNPM for managing dependencies. After cloning the project run these commands to get up and running:

1. `pnpm install`
2. `docker compose up database` (requires Docker for running a development database, if you use something else, just make sure to adjust the `DATABASE_URL` environment variable)
3. Copy the `.env.example` and replace the values with appropriate ones for your setup
4. `pnpm dev` starts up a development server.
5. See the application at `http://localhost:3000`

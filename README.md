# Basic CRM (Server)

### Next, React, GraphQL, Mongo

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker

```bash
docker build --build-arg DB_MONGO=<mongo-url-connection> -t crm-next-apollo-backend:latest .

docker run -p 4005:4005 crm-next-apollo-backend
```

#### Made with ❤️ by Leandro Arturi

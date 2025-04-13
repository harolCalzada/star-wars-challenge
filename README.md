# Star Wars API Integration Challenge

## Overview

This project integrates the Star Wars API with another external API to provide enriched character data through a RESTful service.

## Requirements

### API Integration

- Fetch character data from the Star Wars API (SWAPI)
- Integrate with an additional external API of choice
- Combine data from both APIs into a unified response

### API Endpoints

#### 1. Get Characters

```
GET /api/v1/characters
```

- Returns combined data from both APIs
- Includes caching with 30-minute expiration

#### 2. Create Character

```
POST /api/v1/characters
```

- Allows adding new character entries

#### 3. View API History

```
GET /api/v1/history
```

- Tracks and displays all external API requests

### Technical Features

- RESTful API design
- 30-minute data caching implementation
- Request history logging
- Deploy on AWS Lambda and API Gateway
- Use DynamoDB or MySQL for storage
- Use TypeScript
- The project should be include unit tests

### Solution

The solution will be a RESTful API that integrates the Star Wars API with another external API to provide enriched character data.

### External APIs

The service will show you the character data from the Star Wars API and a random joke the character tells from the Jokes API.

- Star Wars API (SWAPI): https://swapi.dev/api/
- Jokes API: https://sv443.net/jokeapi/v2/

### Infrastructure

The service will be deployed on AWS Lambda and API Gateway using Serverless framework.

### Storage

The service will use DynamoDB for storage.

### Security

The service will use API Gateway for security.

### Testing

The service will be tested using Jest.

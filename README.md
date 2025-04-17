# Star Wars API Integration Challenge

## Overview

This project provides a RESTful API service that integrates the Star Wars API (SWAPI) with The Movie Database (TMDB) API to offer enhanced character information with movie details, caching, and storage capabilities.

## Features

- RESTful API design with Fastify
- Integration with SWAPI and TMDB APIs
- Redis caching with 30-minute expiration
- DynamoDB storage integration
- Comprehensive unit tests with Jest
- TypeScript implementation
- Rate limiting
- CORS support

## API Endpoints

### Characters

#### Get All Characters

```
GET /characters
```

- Returns a list of Star Wars characters
- Includes caching with 30-minute expiration

#### Get Character by ID

```
GET /character/{id}
```

- Returns detailed information about a specific character
- Enriched with movie details from TMDB API
- Includes caching with 30-minute expiration
- Parameters:
  - `id`: Character ID (required)

### Generic Data

#### Get All Data by Type

```
GET /data
```

- Returns a list of available SWAPI resource types

#### Get Data by Type and ID

```
GET /data/{type}/{id}
```

- Returns data for any SWAPI resource type
- Parameters:
  - `type`: Resource type (e.g., 'films', 'planets', 'species', 'vehicles', 'starships')
  - `id`: Resource ID

### History

#### Get API Request History

```
GET /history
```

- Returns a log of API requests made to external services

## External APIs

- Star Wars API (SWAPI): https://swapi.dev/api/
- The Movie Database (TMDB): https://api.themoviedb.org/
  - Used to enrich character details with movie information

## Infrastructure

### Storage

- DynamoDB for persistent storage
- Redis for caching

### Security

- Rate limiting implemented
- CORS configuration
- API versioning

### Testing

Comprehensive unit tests implemented using Jest, covering:

- Controllers
- Services
- Repository layer
- Cache integration

To run tests:

```bash
npm test
```

## API Documentation

Swagger documentation is available at:

### Local Development
```
http://localhost:3000/documentation
```

### AWS Lambda (Production)
```
https://mzee34bwr4.execute-api.us-east-1.amazonaws.com/documentation
```

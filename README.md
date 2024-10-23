# Search engine for ski accomodations

## Features
- Search - returns an ID for a specific search (according payload)
- SearchById - returns the results for specfic search key
- Bonus: <br>
    a) rate limiter  <br>
    b) Stateless API

## Dependencies
- Node.js
- MongoDB

## Installation

```bash
$ npm install
```

## Running this server 

```bash
$ npm run start
```




Search: <br>
 http://localhost:4000/api/accommodations/search

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729685902/obtuuo0s1l4sezplzvlc.png)


Search by id: <br>
 http://localhost:4000/api/accommodations/search/:id

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729685992/g8w5gvpsfzeyfybv1tql.png)
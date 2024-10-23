# Search engine for ski accomodations

## Features
- Search - returns an ID for a specific search (according payload)
- SearchById - returns the results for specfic search key
- Bonus: <br>
    a) Rate limiter  <br>
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
> [!IMPORTANT]
> Server is running on port 4000 (but you can change the port using the config file)
מ

## Endpoints
<b> Search: </b> <br>
 http://localhost:4000/api/accommodations/search

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729685902/obtuuo0s1l4sezplzvlc.png)


Handle errros: <br>

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729707517/dcre6cfik8umcoy21gfu.png)


<b> Search by id: </b> <br>
 http://localhost:4000/api/accommodations/search/:id

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729685992/g8w5gvpsfzeyfybv1tql.png)

Handle error: <br>

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729707665/z1qw4heulgijtay4djs7.png)


# Search engine for ski accomodations

## Features
- Search - returns an ID for a specific search (according payload)
- SearchById - returns the results for specfic search key
- <ins>Bonus: </ins> <br>
    a) Rate limiter  <br>
    b) Stateless API

## Dependencies
- Node.js (v22.4.0 is preferred)
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


## Endpoints
<b> Search: </b> <br>
 http://localhost:4000/api/accommodations/search

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729712936/ijet2k1fm4uf1yqkorjw.png)


Handle errros: <br>

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729707517/dcre6cfik8umcoy21gfu.png)


<b> Search by id: </b> <br>
 http://localhost:4000/api/accommodations/search/:id

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729713165/pxezzmqsqu2q3itia1yl.png)

Handle error: <br>

![Image of design](https://res.cloudinary.com/dtwqtpteb/image/upload/v1729707665/z1qw4heulgijtay4djs7.png)


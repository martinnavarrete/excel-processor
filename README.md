# excel-processor

This app is implemented in Express with Typescript.

## What this app do

It allows you to upload csv files and its format and after that the app automatically process the file.

## Npm commands

### Install dependencies

`npm i`

### Build app

`npm run build`

### Run eslint

`npm run lint`

### Run prettier

`npm run format`

### Run app

`npm run start`

### Run app in dev mode

`npm run dev`

### Run tests

`npm run test`

## How to use the API

### Authentication

All the endpoint must use a bearer token, for this first version will be enough just send the `123` token.

### Upload a csv file

You can do it with the following curl:

```
curl --location -g --request POST 'http://localhost:3000/files?expectedFormat={"A": {"name": "name", "type": "string"}, "B": {"name": "age", "type": "number"}}' \
--header 'Authorization: Bearer 123' \
--form 'file=@"filePath"'
```

`expectedFormat`: here you have to send the format has the csv columns, indicating the column letter, its header name and value data type in a JSON format.

`body`: it must form type with a `file` field. The first row of the file is assumed that are the headers and is not processed. You have file examples [here](/resources/testfiles/).

`response`: this endpoint return a dto like this example:

```
{
    "id": "6423997206bd7af908167054"
}
```

### Get file information

You can do it with the following curl:

```
curl --location --request GET 'http://localhost:3000/files/:fileId' \
--header 'Authorization: Bearer 123'
```

`fileId`: here must be the file id

`response`: this endpoint return a dto like this example:

```
{
    "id": "6423997206bd7af908167054",
    "status": "DONE",
    "errors": 2
}
```

### Get file processing errors(paginated)

You can do it with the following curl:

```
curl --location --request GET 'http://localhost:3000/files/:fileId/errors?size=10&page=0' \
--header 'Authorization: Bearer 123'
```

`fileId`: here must be the file id

`size`: page size, starts in 1

`page`: page number, starts in 0

`response`: this endpoint return a dto like this example:

```
{
    "data": [
        {
            "column": "B",
            "row": 7,
            "message": "Row value does not match expected type"
        },
        {
            "column": "B",
            "row": 4,
            "message": "Row value does not match expected type"
        }
    ],
    "total": 2,
    "page": 0,
    "size": 10
}
```

### Get file processed data (paginated)

You can do it with the following curl:

```
curl --location --request GET 'http://localhost:3000/files/:fileId/processed-data?size=10&page=0' \
--header 'Authorization: Bearer 123'
```

`fileId`: here must be the file id

`size`: page size, starts in 1

`page`: page number, starts in 0

`response`: this endpoint return a dto like this example:

```
{
    "data": [
        {
            "name": "Lena Brown",
            "age": 58
        },
        {
            "name": "Megan Adams",
            "age": 25
        },
        {
            "name": "Julia Hernandez",
            "age": 32
        },
        {
            "name": "Avery Davis",
            "age": 73
        }
    ],
    "total": 4,
    "page": 0,
    "size": 10
}
```

Important: In this case the object structure inside `data` can be different between files because each one has its own format.

## Used libraries

`express`: as http framework, makes easier the middleware and endpoint handling.

`typescript`: makes the project more maintainable and easy to understand, also avoid types errors in some cases.

`csv-parse`: to make easier, faster and more safe the csv parsing.

`json-schema`: to parse correctly the format received.

`mongoose`: MongoDB ORM, handle the entities between mongo and node.

`multer`: used for receiving files in an endpoint.

`jest`: used for unit testing.

`nodemon`: to automaticaly update changes on the running instance on the development stage.

`eslint`: to check code looking for unused variables, spelling mistakes, etc.

`prettier`: to fix tabulation, spaces, etc. on the code.

## Things to improve

Some things couldn't be do it because of the deadline but can be do it in the future. Some of them are:

- Add a login and improve the authentication
- Add a centralized error handling on a middleware
- Add husky to run some task before commits and pushs
- Improve testing on services
- Add an .env file for some data like port number
- Add openAPI documentation

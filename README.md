
## Endpoints for user:
```bash
api/v1/user/sign-in    POST
api/v1/user/sign-up    POST
api/v1/admin/users     GET
api/v1/auth/user-info  GET
api/v1/auth/logout     DELETE
```

## Requests for user:
```bash 
{
POST: SIGN-IN/SIGN-UP
{
    "username": "",
    "password": "",
    "role": ""
}
```

## Endpoints for checklists:
```bash
api/v1/admin/checklist/create  CREATE
api/v1/admin/checklist/update  UPDATE
api/v1/checklist/get           GET ALL
api/v1/checklist/get/:id       GET BY ID
api/v1/admin/checklist/:id     DELETE BY ID
```

## Requests for checklists:
```bash
POST: CREATE

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}

PUT: UPDATE

{
    "title": "",
    "description": "",
    "forAge": ,
    "slug": ""
}
```

## Endpoints for articles:
```bash
api/v1/admin/article/create    CREATE
api/v1/admin/article/update    UPDATE
api/v1/article/get             GET ALL
api/v1/article/get/:id         GET BY ID
api/v1/admin/article/:id       DELETE BY ID
```

## Requests for articles:
```bash

POST: CREATE

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}

PUT: UPDATE

{
    "title": "",
    "content": "",
    "category": "АФК", "Сенсорные игры", "Коммуникативные игры", "Нейроигры",
    "author": "",
    "readTime": ,
    "slug": ""
}
```

## Endpoints for courses:
```bash

api/v1/admin/course/create            CREATE
api/v1/admin/course/update            UPDATE
api/v1/admin/course/:id               DELETE BY ID
api/v1/auth/course/get/:id            GET BY ID
api/v1/auth/course/get                GET ALL
api/v1/auth/course/get-with-access    GET 
api/v1/admin/course/add-video         POST
api/v1/admin/course/give-access       POST
api/v1/admin/course/take-away-access  POST
``` 

## Requests for courses:
```bash
POST:

FORM-DATA: CREATE
    "title": "",
    "description": "",
    "cost": ,
    "diploma": file,
    "img": file

PUT:

FORM-DATA: UPDATE
    "title": "",
    "description": "",
    "cost": ,
    "img": file

POST: ADD-VIDEO
    "course_id": ,
    "videos": file,
    "file": file,
    "title": "",

POST: TAKE-AWAY-ACCESS
    "course_id": ,

POST: GIVE-ACCESS
    "course_id": ,
    "user_id": ,
```

Backend start:
```bash

    cd/backend
    docker compose -up --build

```
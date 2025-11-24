# UMBC-Navigator

Currently, the state of the accessability on UMBC's campus leaves much to be desired. As well, even just trying to find out how to get from point A to point B is a hassle. With this project, we want to make it easy to find a route to any location on campus that somebody would want, while also making it accessable to anybody and everybody. 

The idea for this project comes from Emily (insert last name when we know), Her email is (Ask if we can include her email). Testing testing

## Contacts for project

***Kristina Nokuri***
- *School Email:* UN21693@umbc.edu


***Elizabeth Samotyj***
- *School Email:* AS16410@umbc.edu

***Maxwell Castle***
- *School Email:* maxwelc2@umbc.edu

If there is anything unfinished or bugs to report in existing code, please reach out.

## Format

CURRENT FORMAT
```
.
├── gitsteps.txt
├── react_native
│   ├── html
│   │   ├── first.html
│   │   └── two.html
│   ├── mobile
│   │   ├── app
│   │   ├── app.json
│   │   ├── assets
│   │   ├── components
│   │   ├── constants
│   │   ├── eslint.config.js
│   │   ├── expo-env.d.ts
│   │   ├── hooks
│   │   ├── node_modules
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── README.md
│   │   ├── scripts
│   │   └── tsconfig.json
│   ├── mobile_README.md
│   └── start.txt
├── README.md
└── UMBCNavigator
    ├── manage.py
    └── UMBCNavigator
        ├── asgi.py
        ├── __init__.py
        ├── settings.py
        ├── urls.py
        └── wsgi.py
```

For this project, we want to have a react-native frontend, django backend, ad firebase DB for storage. for resources for Django, look [here](https://docs.djangoproject.com/en/5.2/) 

[This](https://supabase.com/dashboard/project/yjfahjfhyfxgeeweopez) is the link to our Database

The formatting for the repository is simple. In the UMBCNavigator folder is the manage.py file and another UMBCNavigator folder. 
- **manage.py** is used in space of django-admin command. (if you don't know what that is that's ok.) We can do things like change the database or run the lightweight web server. 

In the NESTED UMBCNavigator folder we have 5 files
- **__init__.py**: Simply used as a marker to say that the folder is a package that can be used!
- **asgi.py**: (Asynchronous Server Gateway Interface) Allows multiple functions to be running, switching between tasks based on priotiy. For example, live chats on the site while notifications are popping up
- **settings.py**: Holds all the configuration for the project. For example, admin information, apps installed, middleware installed, etc. this can hold multiple configs and can be changed using manage.py
- **urls.py**: Holds the urls needed for the website's possible pages and views. This also makes sure that the correct page is the one shown. 
- **wsgi.py**: (Web Server Gateway Interface) Allows for simple one at a time processing or functions. For example, GET or POST calls like POSTing a venmo transaction or GETting the public transaction information posted to venmo.

There also exists a "react-native" file for any front end work we may be doing. this folder contains two entries:
- **text.txt**: A text file simply as a place holder for any other things that may be added to the directory
- **html**: A folder that holds two other files. 
    - **first.html**: A sample file for how to write simple html
    - **two.html**: A sample file for how to incorperate OSM onto html

## Install and Setup

This section will be written soon. Python's builtin venv as well as requirements python-pip install will be used. Steps to use will be written out for linux. Windows? unsure. 

The Django version we are using is 5.2.6
The Nodejs version is 22.20.0
The expo versoin is 54.0.11

## Build and Compile

Will be written when started code is done

## Testing Strategy (optional)

## Functionalities

Will be written in later sprint

## Sources

- https://docs.djangoproject.com/en/5.2/ -> for Django resources



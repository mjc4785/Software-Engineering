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


For this project, we want to have a react-native frontend, django backend, ad firebase DB for storage. for resources for Django, look [here](https://docs.djangoproject.com/en/5.2/) 


## Install and Setup

This section will be written soon. Python's builtin venv as well as requirements python-pip install will be used. Steps to use will be written out for linux. Windows? unsure. 

The Django version we are using is 5.2.6
The Nodejs version is 22.20.0
The expo versoin is 54.0.11

## How to Run It (Demo It)
### Loading in sensitive information with environment variables
1. Firstly in the most outermost UMBCNavigator folder, create a file called .env  
It wll store sensitive information-- in this case the database connection url and ORS api key.
The information will be stored in variables stored in your terminal/environment called **environment variables**

2. In .env, paste in this general structure and fill out the following information
```
DATABASE_URL=postgresql://postgres:...
DEBUG=True
ORS_KEY = ...
```
After `DATABASE_URL=` paste in the connection url Kristina sent in the Discord group chat. 
After `ORS_KEY=` paste in your ORS API KEY. You can make an account and get an api key here: https://account.heigit.org/manage/key 

3. Register your environment variables in your current environment
Run:
```
export DATABASE_URL=...
```
and 
```
export ORS_KEY="..."
```

Note: Running the export command on DATABASE_URL doesnt need quotation marks but running it on ORS_KEY does. Be mindful there are no spaces as well. Replace the ... with the values in the .env file

4. Check that your enironment variables are registered
To test DATABASE_URL, run:
```
echo "$DATABASE_URL"
```
The output should return the environment variable

To test ORS_KEY, run:
```
echo "$ORS_KEY"
```
The output should return the environment variable

If the echo commands return nothing, retry step 3.

5. Double check the .gitignore in the same folder. It should have .env in it. 

### 

## Testing Strategy (optional)

## Functionalities


## Sources

- https://docs.djangoproject.com/en/5.2/ -> for Django resources



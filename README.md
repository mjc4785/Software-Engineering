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
```
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

```
For this project, we want to have a react-native frontend, django backend, and supabase DB for storage. 


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

Note: **Running the export command on DATABASE_URL doesnt need quotation marks but running it on ORS_KEY does.** Be mindful there are no spaces as well. Replace the ... with the values in the .env file

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

If the echo commands return nothing, retry step 3 or troubleshoot before proceeding.

5. Double check the .gitignore in the same folder. It should have .env listed in it. This prevents git and github from pushing the .env file to remote.

Now 1) The database should be able to connect and 2) The API key for ORS should be working.

### Making the backend communicate with expo go on the phone
1. Firstly install and make an account in ngrok, a tool used to expose your localhost to the web: [Getting started with ngrok](https://ngrok.com/docs/getting-started)

2. Navigate to outermost UMBCNavigator folder (that has manage.py in it.) Run the backend:
```
./manage.py runserver
```

3. Open up another terminal and run ngrok to expose port 8000 (where the backend runs on default)
```
ngrok http 8000
```

4. You should get something like this in your terminal
```
ngrok                                                           (Ctrl+C to quit)
                                                                                                                                                   
Session Status                online                                            
Account                       Kristina N. (Plan: Free)                          
Update                        update available (version 3.33.1, Ctrl-U to update
Version                       3.30.0                                            
Region                        United States (us)                                
Latency                       78ms                                              
Web Interface                 http://127.0.0.1:4040                             
Forwarding                    https://fc7c58fe27c7.ngrok-free.app -> http://loca...
                                                                                
Connections                   ttl     opn     rt1     rt5     p50     p90       
                              121     0       0.00    0.00    14.03   140.02    
                                                                                
HTTP Requests                                                                   
-------------                                                                   
                                                                                
10:48:38.014 EST GET /api/search-pois/          200 OK   
...
```

- Your URL for your backend exposed to the world is formatted as https://[series of alpha-numeric].ngrok-free.app 
- In this case it's https://fc7c58fe27c7.ngrok-free.app.
- So instead of visiting http://127.0.0.1:8000/api/route/, you visit https://fc7c58fe27c7.ngrok-free.app/api/route/.

- This new url https://fc7c58fe27c7.ngrok-free.app can be used in react-native code so when you demo on expo go, instead of looking on the localhost of the phone, the phone running expo go can see your computer's localhost running the backend.

5. Edit react-native code to go to our online backend

In index.jsx and StepByStepNavigator.jsx find the following constant:
```
const BACKEND_URL = "https://1976b818c288.ngrok-free.app/"
```

Replace this with your ngrok url. **Do not forget the trailing slash!!!**

At this point: 
1) Your backend has the ability to connect to the database and ORS api (for walking paths and directions)
2) Your backend is up and running and can be accessed via localhost and your online ngrok website
3) If you use `npx expo start` your react-native frontend will see your backend by connecting to your online ngrok backend

### Physically Demoing
1. Connect your laptop to your phone's hotspot. I find it helpful to **use a cable** to connect.
2. Run the app on your laptop using the above commands, but instead of `npx expo start` run:
```
npx expo start --tunnel
```
This will make it so your laptop (hotspot) and phone (cellular) can talk to each other.


## Testing Strategy (optional)

## Functionalities


## Sources

- https://docs.djangoproject.com/en/5.2/ -> for Django resources



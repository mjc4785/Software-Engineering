# UMBC-Navigator

Currently, the state of the accessability on UMBC's campus leaves much to be desired. As well, even just trying to find out how to get from point A to point B is a hassle. With this project, we want to make it easy to find a route to any location on campus that somebody would want, while also making it accessable to anybody and everybody. 

The idea for this project comes from Emily (insert last name when we know), Her email is (Ask if we can include her email). Testing testing

Currently, although UMBC is a smaller campus, navigating the campus is tough for new students and visitors. The objective of this application is...  
1) Making navigating via walking path to structures easy
2) Adding support for custom points of interests within buildings that are not shown on major navigation applications. 
    For example, the financial aid office and study abroad office are shown on the map and can be navigated to
3) Allowing students to "search like students." For example "ITE" -> Information Technology and Engineering Building, and "PAHB"-> Performing Arts and Humanities Building

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
For this project, we have a react-native frontend, django backend, and supabase DB for storage. 


## Install and Setup

The Django version we are using is 5.2.6
The Nodejs version is 22.20.0
The expo version is 54.0.11

### Set up the python environment 
1. Create a virtual environment
2. Pip install using requirements.txt to download necessary files. 
```
anyio==4.11.0
argon2-cffi==25.1.0
argon2-cffi-bindings==25.1.0
arrow==1.4.0
asgiref==3.11.0
asttokens==3.0.1
async-lru==2.0.5
attrs==25.4.0
babel==2.17.0
beautifulsoup4==4.14.2
bleach==6.3.0
certifi==2025.11.12
cffi==2.0.0
charset-normalizer==3.4.4
comm==0.2.3
debugpy==1.8.17
decorator==5.2.1
defusedxml==0.7.1
dj-database-url==3.0.1
Django==5.2.8
django-cors-headers==4.9.0
django-filter==25.2
djangorestframework==3.16.1
djangorestframework-gis==1.2.0
djangorestframework_simplejwt==5.5.1
et_xmlfile==2.0.0
executing==2.2.1
fastjsonschema==2.21.2
fqdn==1.5.1
greenlet==3.2.4
h11==0.16.0
httpcore==1.0.9
httpx==0.28.1
idna==3.11
ipykernel==7.1.0
ipython==9.7.0
ipython_pygments_lexers==1.1.1
isoduration==20.11.0
jedi==0.19.2
Jinja2==3.1.6
json5==0.12.1
jsonpointer==3.0.0
jsonschema==4.25.1
jsonschema-specifications==2025.9.1
jupyter-events==0.12.0
jupyter-lsp==2.3.0
jupyter_client==8.6.3
jupyter_core==5.9.1
jupyter_server==2.17.0
jupyter_server_terminals==0.5.3
jupyterlab==4.5.0
jupyterlab_pygments==0.3.0
jupyterlab_server==2.28.0
lark==1.3.1
MarkupSafe==3.0.3
matplotlib-inline==0.2.1
mistune==3.1.4
nbclient==0.10.2
nbconvert==7.16.6
nbformat==5.10.4
nest-asyncio==1.6.0
networkx==3.6
notebook==7.5.0
notebook_shim==0.2.4
numpy==2.3.5
openpyxl==3.1.5
packaging==25.0
pandas==2.3.3
pandocfilters==1.5.1
parso==0.8.5
pexpect==4.9.0
platformdirs==4.5.0
prometheus_client==0.23.1
prompt_toolkit==3.0.52
psutil==7.1.3
psycopg2-binary==2.9.11
ptyprocess==0.7.0
pure_eval==0.2.3
pycparser==2.23
Pygments==2.19.2
PyJWT==2.10.1
python-dateutil==2.9.0.post0
python-dotenv==1.2.1
python-json-logger==4.0.0
pytz==2025.2
PyYAML==6.0.3
pyzmq==27.1.0
referencing==0.37.0
requests==2.32.5
rfc3339-validator==0.1.4
rfc3986-validator==0.1.1
rfc3987-syntax==1.1.0
rpds-py==0.29.0
Send2Trash==1.8.3
setuptools==80.9.0
shapely==2.1.2
six==1.17.0
sniffio==1.3.1
soupsieve==2.8
SQLAlchemy==2.0.44
sqlparse==0.5.3
stack-data==0.6.3
terminado==0.18.1
tinycss2==1.4.0
tornado==6.5.2
traitlets==5.14.3
typing_extensions==4.15.0
tzdata==2025.2
uri-template==1.3.0
urllib3==2.5.0
wcwidth==0.2.14
webcolors==25.10.0
webencodings==0.5.1
websocket-client==1.9.0

```

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
In the terminal run:
(Put the actual values in the ...)
```
export DATABASE_URL=...
```
and 
```
export ORS_KEY="..."
```

Note: **Running the export command on DATABASE_URL doesnt need quotation marks but running it on ORS_KEY does.** Be mindful there are no spaces as well. Replace the ... with the values in the .env file

4. Check that your enironment variables are registered
In the terminal...  
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

2. Navigate to outermost UMBCNavigator folder (that has manage.py in it.) In the terminal run the backend:
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

In **both** the index.jsx and StepByStepNavigator.jsx files find the following constant:
```
const BACKEND_URL = "https://1976b818c288.ngrok-free.app/"
```

Replace the current url with your generated ngrok url. **Do not forget the trailing slash!!!**

At this point: 
1) Your backend has the ability to connect to the database and ORS api (for walking paths and directions)
2) Your backend is up and running and can be accessed via localhost and your online ngrok website
3) If you use `npx expo start` your react-native frontend will see your backend by connecting to your online ngrok backend

### Physically Demoing
1. Connect your laptop to your phone's hotspot. I find it helpful to **use a charger/usb to lightning cable** to connect.
2. Run the app on your laptop using the above instructions, but instead of `npx expo start` run:
```
npx expo start --tunnel
```
This will make it so your laptop (hotspot) and phone (cellular) can talk to each other.

This method of demoing allows:  
1) The user to walk around, unrestrained by wifi connectivity
2) The phone and computer networks to speak to eachother


## Testing Strategy (optional)

## Functionalities


## Sources

- https://docs.djangoproject.com/en/5.2/ -> for Django resources



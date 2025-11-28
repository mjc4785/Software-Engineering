### How to run the backend!
#### Connecting the backend to the database
1. In the UMBCNavigator folder (most outward one), make a file called `.env`
2. Double check the `.gitignore` file to make sure `.env` is present. This will prevent `.env` files from being pushed to remote (github remote, that is). In turn, this prevents sensitive info like passwords from being pushed to github.
3. The general structure of the `.env` is:
```
DATABASE_URL=postgresql://postgres:[password].yjfahjfhyfxgeeweopez.supabase.co:5432/postgres
DEBUG=True
```
Copy and paste the above contents into your `.env`
Note: There are two **environment variables**- DATABASE_URL and DEBUG 

4. Get the full database url and/or password from Kristina and replace the [password] part in the DATABASE_URL environment variable

5. In the terminal, double check if your environment variable works using
```
echo "$DATABASE_URL"
```

If the database url is not outputted, do:
```
export DATABASE_URL=postgresql://postgres:[password].yjfahjfhyfxgeeweopez.supabase.co:5432/postgres
```
Note: rather than [password] put the actual password that Kristina provided

Then try again:
```
echo "$DATABASE_URL"
```
The full database url should be outputted.
Now you can connect your backend to the database via connection string.

#### Connecting the backend to demo frontend using ngrok

1. Firstly install and make an account in ngrok, a tool used to expose your localhost to the web: [Getting started with ngrok](https://ngrok.com/docs/getting-started)

2. Run the backend
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
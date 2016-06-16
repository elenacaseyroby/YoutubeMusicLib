#!flask/bin/python
from app import app
app.run(debug=True) #imports app var from the app package 
					#we made and calls its run method to start server.  
					#since app var is Flask instance, we didn't have to 
					#write the run method, it came for free.
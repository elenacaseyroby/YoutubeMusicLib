#!flask/bin/python
from app import app
import os
port = int(os.environ.get("PORT", 5000))
app.run(debug=True, host='0.0.0.0', port=port) #imports app var from the app package 
					#we made and calls its run method to start server.  
					#since app var is Flask instance, we didn't have to 
					#write the run method, it came for free.
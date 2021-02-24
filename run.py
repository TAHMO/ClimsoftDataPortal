from app import app
from waitress import serve
from dotenv import load_dotenv
import os

load_dotenv()

if __name__ == '__main__':
	# app.run()
	serve(app, host='0.0.0.0', port=os.environ.get("PORT"))
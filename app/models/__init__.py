import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from flask_security import SQLAlchemySessionUserDatastore
from app.models.base import Base
from app.models.user import User, Role
from dotenv import load_dotenv

load_dotenv()
engine = create_engine('mysql+pymysql://{0}'.format(os.environ.get("DATABASE_URI")))

from app.models import station
from app.models import variable
from app.models import user
from app.models import export

Base.metadata.create_all(engine)
DBSession = sessionmaker(bind=engine)
db = scoped_session(DBSession)
Base.query = db.query_property()

user_datastore = SQLAlchemySessionUserDatastore(db, User, Role)
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from app.models.base import Base

engine = create_engine('mysql+pymysql://{0}'.format(os.environ.get("DATABASE_URI")))

from app.models import station
from app.models import variable
from app.models import user

Base.metadata.create_all(engine)
DBSession = sessionmaker(bind=engine)
db = scoped_session(DBSession)
Base.query = db.query_property()